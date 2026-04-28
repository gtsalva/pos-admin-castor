import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ReportsApiService } from '../services/reports-api.service';
import { RevenueReport, RevenueFilters } from '../models/report.model';
import { KpiCardComponent } from '../shared/kpi-card/kpi-card.component';
import { ReportFilterBarComponent, FilterBarValues } from '../shared/report-filter-bar/report-filter-bar.component';

Chart.register(...registerables);

const PAYMENT_LABEL: Record<string, string> = {
  CASH: 'Efectivo',
  CARD: 'Tarjeta',
  TRANSFER: 'Transferencia',
};

const PM_COLORS: Record<string, string> = {
  CASH: '#C85A1A',
  CARD: '#4E7FA8',
  TRANSFER: '#7BA05B',
};

@Component({
  selector: 'app-revenue',
  standalone: true,
  imports: [
    DecimalPipe,
    BaseChartDirective,
    NzGridModule, NzCardModule, NzTableModule, NzTagModule,
    NzSpinModule, NzDividerModule, NzButtonModule, NzIconModule,
    KpiCardComponent, ReportFilterBarComponent,
  ],
  template: `
    <app-report-filter-bar
      [config]="{ showPeriod: true, showPaymentMethod: true, showCategory: true }"
      (filtersChange)="onFilters($event)"
    />

    @if (loading()) {
      <nz-spin nzTip="Cargando reporte..." style="display:block;text-align:center;padding:40px" />
    } @else {
      <nz-row [nzGutter]="16" style="margin-bottom:20px">
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ingresos totales"
            [value]="'$' + (report().totals.total_revenue | number:'1.0-0')"
            accentColor="#C85A1A"
          />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ventas realizadas"
            [value]="(report().totals.total_sales | number) ?? '0'"
            accentColor="#4E7FA8"
          />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ticket promedio"
            [value]="'$' + (report().totals.avg_ticket | number:'1.0-2')"
            accentColor="#7BA05B"
          />
        </nz-col>
      </nz-row>

      <nz-card nzTitle="Tendencia de ingresos" style="margin-bottom:16px">
        <div style="height:260px;position:relative">
          <canvas baseChart
            [data]="trendChartData()"
            [options]="trendOptions"
            type="line"
          ></canvas>
        </div>
      </nz-card>

      <nz-row [nzGutter]="16">
        <nz-col [nzSpan]="10">
          <nz-card nzTitle="Por método de pago">
            <div style="height:260px;position:relative">
              <canvas baseChart
                [data]="pmDonutData()"
                [options]="donutOptions"
                type="doughnut"
              ></canvas>
            </div>
            <nz-table
              [nzData]="report().by_payment_method"
              [nzShowPagination]="false"
              nzSize="small"
              [nzBordered]="false"
              style="margin-top:12px"
            >
              <thead>
                <tr>
                  <th>Método</th>
                  <th nzAlign="right">Ventas</th>
                  <th nzAlign="right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                @for (row of report().by_payment_method; track row.payment_method) {
                  <tr>
                    <td>
                      <nz-tag [nzColor]="pmTagColor(row.payment_method)">
                        {{ pmLabel(row.payment_method) }}
                      </nz-tag>
                    </td>
                    <td nzAlign="right">{{ row.sales_count | number }}</td>
                    <td nzAlign="right" style="font-weight:600">${'$'}{{ row.revenue | number:'1.0-2' }}</td>
                  </tr>
                }
              </tbody>
            </nz-table>
          </nz-card>
        </nz-col>

        <nz-col [nzSpan]="14">
          <nz-card nzTitle="Por categoría" [nzExtra]="exportTpl">
            <div style="height:200px;position:relative">
              <canvas baseChart
                [data]="catBarData()"
                [options]="catBarOptions"
                type="bar"
              ></canvas>
            </div>
            <nz-table
              [nzData]="report().by_category"
              [nzShowPagination]="false"
              nzSize="small"
              [nzBordered]="false"
              style="margin-top:12px"
            >
              <thead>
                <tr>
                  <th>Categoría</th>
                  <th nzAlign="right">Unidades</th>
                  <th nzAlign="right">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                @for (row of report().by_category; track (row.category_id ?? row.category_name)) {
                  <tr>
                    <td>{{ row.category_name ?? 'Sin categoría' }}</td>
                    <td nzAlign="right">{{ row.units_sold | number }}</td>
                    <td nzAlign="right" style="font-weight:600">${'$'}{{ row.revenue | number:'1.0-2' }}</td>
                  </tr>
                }
              </tbody>
            </nz-table>
          </nz-card>
        </nz-col>
      </nz-row>
    }

    <ng-template #exportTpl>
      <button nz-button nzSize="small" (click)="exportCsv()">
        <span nz-icon nzType="download"></span> CSV
      </button>
    </ng-template>
  `,
})
export class RevenueComponent implements OnInit {
  private api = inject(ReportsApiService);

  report = signal<RevenueReport>({
    trend: [], by_payment_method: [], by_category: [],
    totals: { total_revenue: 0, total_sales: 0, avg_ticket: 0 },
  });
  loading = signal(true);

  trendChartData = computed<ChartData<'line'>>(() => ({
    labels: this.report().trend.map((p) => {
      const d = new Date(p.period);
      return `${d.getDate()}/${d.getMonth() + 1}`;
    }),
    datasets: [{
      label: 'Ingresos',
      data: this.report().trend.map((p) => p.revenue),
      borderColor: '#C85A1A',
      backgroundColor: 'rgba(200,90,26,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#C85A1A',
      pointRadius: 4,
    }],
  }));

  pmDonutData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.report().by_payment_method.map((r) => PAYMENT_LABEL[r.payment_method] ?? r.payment_method),
    datasets: [{
      data: this.report().by_payment_method.map((r) => r.revenue),
      backgroundColor: this.report().by_payment_method.map((r) => PM_COLORS[r.payment_method] ?? '#E8A857'),
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }));

  catBarData = computed<ChartData<'bar'>>(() => ({
    labels: this.report().by_category.map((r) => r.category_name ?? 'Sin categoría'),
    datasets: [{
      label: 'Ingresos',
      data: this.report().by_category.map((r) => r.revenue),
      backgroundColor: '#E8A857',
      borderRadius: 4,
      borderSkipped: false,
    }],
  }));

  trendOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#8C7B75' } },
      y: { grid: { color: '#F0E6DB' }, ticks: { color: '#8C7B75' } },
    },
  };

  donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#3A2820', padding: 10 } } },
    cutout: '60%',
  };

  catBarOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#3A2820', maxRotation: 35 } },
      y: { grid: { color: '#F0E6DB' }, ticks: { color: '#8C7B75' } },
    },
  };

  pmLabel(pm: string): string { return PAYMENT_LABEL[pm] ?? pm; }
  pmTagColor(pm: string): string {
    return pm === 'CASH' ? 'volcano' : pm === 'CARD' ? 'blue' : 'green';
  }

  ngOnInit(): void { this.load({}); }

  onFilters(filters: FilterBarValues): void { this.load(filters as RevenueFilters); }

  private load(filters: RevenueFilters): void {
    this.loading.set(true);
    this.api.getRevenue(filters).subscribe({
      next: (r) => { this.report.set(r); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportCsv(): void {
    const header = 'Período,Ingresos,Ventas';
    const rows = this.report().trend.map((p) =>
      `${p.period},${p.revenue.toFixed(2)},${p.sales_count}`
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'reporte-ingresos.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
