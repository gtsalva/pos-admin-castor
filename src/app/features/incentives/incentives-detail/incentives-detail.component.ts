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
import { DecimalPipe, DatePipe } from '@angular/common';
import { IncentivesApiService } from '../services/incentives-api.service';
import { PeriodPerformance, SalespersonPerformance } from '../models/incentive.model';

@Component({
  selector: 'app-incentives-detail',
  standalone: true,
  imports: [
    RouterLink, NzTableModule, NzTagModule, NzProgressModule, NzButtonModule,
    NzIconModule, NzStatisticModule, NzCardModule, NzGridModule,
    NzPopconfirmModule, NzSpinModule, DecimalPipe, DatePipe,
  ],
  templateUrl: './incentives-detail.component.html',
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
