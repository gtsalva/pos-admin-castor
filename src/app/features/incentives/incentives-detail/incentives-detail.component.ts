import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { DatePipe } from '@angular/common';
import { IncentivesApiService } from '../services/incentives-api.service';
import { PeriodPerformance, SalespersonPerformance } from '../models/incentive.model';
import { QuetzalesPipe } from '../../../shared/pipes/quetzales.pipe';

@Component({
  selector: 'app-incentives-detail',
  standalone: true,
  imports: [
    RouterLink, NzTableModule, NzTagModule, NzProgressModule, NzButtonModule,
    NzIconModule, NzStatisticModule, NzCardModule, NzGridModule,
    NzPopconfirmModule, NzSpinModule, DatePipe, QuetzalesPipe,
  ],
  templateUrl: './incentives-detail.component.html',
  styles: [`
    .page-container {
      padding: 36px 40px 48px;
      max-width: 1400px;
    }

    .page-header {
      margin-bottom: 32px;
    }

    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      color: #C85A1A;
      font-size: 13px;
      font-weight: 500;
      letter-spacing: 0.2px;
      padding: 0;
      margin-bottom: 12px;
    }

    .period-title {
      margin: 0 0 8px !important;
      font-size: 28px;
      font-weight: 700;
      color: #2c2420;
      line-height: 1.2;
    }

    .period-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #888;
      font-size: 13px;
    }

    .stats-row {
      margin-bottom: 32px;
    }

    .stat-card {
      border-radius: 10px;
      border: 1px solid rgba(200, 90, 26, 0.12);
      box-shadow: 0 1px 4px rgba(0,0,0,0.04);
    }

    .table-section {
      background: #fff;
      border-radius: 10px;
      border: 1px solid #f0ebe6;
      overflow: hidden;
    }
  `],
})
export class IncentivesDetailComponent implements OnInit {
  private readonly api = inject(IncentivesApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly msg = inject(NzMessageService);

  readonly data = signal<PeriodPerformance | null>(null);
  readonly loading = signal(false);
  readonly liquidating = signal<string | null>(null);

  get period_id(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  readonly totals = computed(() => {
    const perf = this.data()?.performance ?? [];
    return {
      total_sold: perf.reduce((s, p) => s + p.amount_sold, 0),
      total_commission: perf.reduce((s, p) => s + p.commission_earned, 0),
      liquidated_count: perf.filter(p => p.is_liquidated).length,
      pending_count: perf.filter(p => !p.is_liquidated).length,
    };
  });

  private static readonly fmt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  readonly totalsStr = computed(() => {
    const t = this.totals();
    const f = IncentivesDetailComponent.fmt;
    return {
      total_sold: 'Q ' + f.format(t.total_sold),
      total_commission: 'Q ' + f.format(t.total_commission),
    };
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getPeriodPerformance(this.period_id).subscribe({
      next: d => { this.data.set(d); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  progressColor(pct: number): string {
    if (pct >= 100) return '#52c41a';
    if (pct >= 50) return '#C85A1A';
    return '#faad14';
  }

  readonly formatProgress = (pct: number) => `${pct}%`;

  liquidate(perf: SalespersonPerformance): void {
    this.liquidating.set(perf.salesperson_id);
    this.api.liquidate(this.period_id, perf.salesperson_id).subscribe({
      next: () => {
        this.msg.success(`${perf.full_name} liquidado correctamente`);
        this.liquidating.set(null);
        this.load();
      },
      error: (err: { error?: { message?: string } }) => {
        this.msg.error(err?.error?.message ?? 'Error al liquidar');
        this.liquidating.set(null);
      },
    });
  }
}
