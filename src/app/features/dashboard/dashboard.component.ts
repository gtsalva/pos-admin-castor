import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { NzStatisticModule } from 'ng-zorro-antd/statistic';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { SalesApiService } from '../sales/services/sales-api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NzStatisticModule, NzCardModule, NzGridModule, NzSpinModule],
  template: `
    <div class="dashboard">
      <h2>Dashboard</h2>
      @if (loading()) {
        <nz-spin nzTip="Cargando..." />
      } @else {
        <nz-row [nzGutter]="16">
          <nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Ventas hoy"
                [nzValue]="totalHoyStr()"
                [nzValueStyle]="{ color: '#C85A1A' }"
              />
            </nz-card>
          </nz-col>
          <nz-col [nzSpan]="6">
            <nz-card>
              <nz-statistic
                nzTitle="Transacciones hoy"
                [nzValue]="transaccionesHoy()"
                [nzValueStyle]="{ color: '#3D3432' }"
              />
            </nz-card>
          </nz-col>
        </nz-row>
      }
    </div>
  `,
  styles: ['.dashboard { padding: 24px; }'],
})
export class DashboardComponent implements OnInit {
  private readonly salesApi = inject(SalesApiService);

  private static readonly fmt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  readonly loading = signal(true);
  readonly totalHoy = signal(0);
  readonly transaccionesHoy = signal(0);

  readonly totalHoyStr = computed(() =>
    'Q ' + DashboardComponent.fmt.format(this.totalHoy())
  );

  ngOnInit(): void {
    const today = new Date().toISOString().split('T')[0];
    this.salesApi.getSales({ from_date: today, limit: 500 }).subscribe({
      next: result => {
        const completed = result.data.filter(s => s.status === 'COMPLETED');
        this.totalHoy.set(completed.reduce((sum, s) => sum + Number(s.total), 0));
        this.transaccionesHoy.set(completed.length);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
