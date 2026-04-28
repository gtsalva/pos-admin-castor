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
import { TopSellerRow, TopSellersFilters } from '../models/report.model';
import { KpiCardComponent } from '../shared/kpi-card/kpi-card.component';
import { ReportFilterBarComponent, FilterBarValues } from '../shared/report-filter-bar/report-filter-bar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-top-sellers',
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
      [config]="{ showLimit: true }"
      (filtersChange)="onFilters($event)"
    />

    @if (loading()) {
      <nz-spin nzTip="Cargando reporte..." style="display:block;text-align:center;padding:40px" />
    } @else {
      <nz-row [nzGutter]="16" style="margin-bottom:20px">
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Total vendedores"
            [value]="data().length"
            accentColor="#C85A1A"
          />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ingresos totales"
            [value]="'$' + (totalRevenue() | number:'1.0-0')"
            accentColor="#E8A857"
          />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ticket promedio"
            [value]="'$' + (avgTicket() | number:'1.0-0')"
            accentColor="#7BA05B"
          />
        </nz-col>
      </nz-row>

      <nz-row [nzGutter]="16">
        <nz-col [nzSpan]="14">
          <nz-card nzTitle="Ranking por ingresos" [nzExtra]="exportTpl">
            <div style="height:320px;position:relative">
              <canvas baseChart
                [data]="barChartData()"
                [options]="barOptions"
                type="bar"
              ></canvas>
            </div>
          </nz-card>
        </nz-col>
        <nz-col [nzSpan]="10">
          <nz-card nzTitle="Participación en ventas">
            <div style="height:320px;position:relative">
              <canvas baseChart
                [data]="donutChartData()"
                [options]="donutOptions"
                type="doughnut"
              ></canvas>
            </div>
          </nz-card>
        </nz-col>
      </nz-row>

      <nz-divider />

      <nz-card nzTitle="Detalle por vendedor">
        <nz-table
          #table
          [nzData]="data()"
          [nzBordered]="false"
          nzSize="middle"
          [nzShowPagination]="false"
        >
          <thead>
            <tr>
              <th nzWidth="50px">#</th>
              <th>Vendedor</th>
              <th nzAlign="right">Ventas</th>
              <th nzAlign="right">Ingresos</th>
              <th nzAlign="right">Ticket promedio</th>
              <th nzAlign="center">Participación</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track row.salesperson_id; let i = $index) {
              <tr>
                <td>
                  @if (i === 0) { <nz-tag nzColor="gold">1°</nz-tag> }
                  @else if (i === 1) { <nz-tag nzColor="default">2°</nz-tag> }
                  @else if (i === 2) { <nz-tag nzColor="volcano">3°</nz-tag> }
                  @else { {{ i + 1 }} }
                </td>
                <td style="font-weight:500">{{ row.salesperson_name }}</td>
                <td nzAlign="right">{{ row.total_sales | number }}</td>
                <td nzAlign="right" style="color:#C85A1A;font-weight:600">
                  ${{ row.total_revenue | number:'1.0-2' }}
                </td>
                <td nzAlign="right">${{ row.avg_sale_value | number:'1.0-2' }}</td>
                <td nzAlign="center">
                  <span style="color:#E8A857;font-weight:600">
                    {{ totalRevenue() > 0 ? ((row.total_revenue / totalRevenue() * 100) | number:'1.1-1') : '0' }}%
                  </span>
                </td>
              </tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    }

    <ng-template #exportTpl>
      <button nz-button nzSize="small" (click)="exportCsv()">
        <span nz-icon nzType="download"></span> CSV
      </button>
    </ng-template>
  `,
})
export class TopSellersComponent implements OnInit {
  private api = inject(ReportsApiService);

  data = signal<TopSellerRow[]>([]);
  loading = signal(true);

  totalRevenue = computed(() => this.data().reduce((s, r) => s + r.total_revenue, 0));
  avgTicket = computed(() => {
    const totalSales = this.data().reduce((s, r) => s + r.total_sales, 0);
    return totalSales > 0 ? this.totalRevenue() / totalSales : 0;
  });

  readonly COLORS = ['#C85A1A', '#E8A857', '#7BA05B', '#4E7FA8', '#A0522D', '#D4896A'];

  barChartData = computed<ChartData<'bar'>>(() => ({
    labels: this.data().map((r) => r.salesperson_name.split(' ')[0]),
    datasets: [{
      label: 'Ingresos',
      data: this.data().map((r) => r.total_revenue),
      backgroundColor: this.data().map((_, i) =>
        i === 0 ? '#C85A1A' : i === 1 ? '#E8A857' : '#D4896A'
      ),
      borderRadius: 6,
      borderSkipped: false,
    }],
  }));

  donutChartData = computed<ChartData<'doughnut'>>(() => ({
    labels: this.data().map((r) => r.salesperson_name.split(' ')[0]),
    datasets: [{
      data: this.data().map((r) => r.total_revenue),
      backgroundColor: this.COLORS,
      borderWidth: 2,
      borderColor: '#fff',
    }],
  }));

  barOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#F0E6DB' }, ticks: { color: '#8C7B75' } },
      y: { grid: { display: false }, ticks: { color: '#3A2820', font: { weight: '600' } } },
    },
  };

  donutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom', labels: { color: '#3A2820', padding: 12 } },
    },
    cutout: '65%',
  };

  ngOnInit(): void {
    this.load({});
  }

  onFilters(filters: FilterBarValues): void {
    this.load(filters as TopSellersFilters);
  }

  private load(filters: TopSellersFilters): void {
    this.loading.set(true);
    this.api.getTopSellers(filters).subscribe({
      next: (rows) => { this.data.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportCsv(): void {
    const headers = 'Vendedor,Ventas,Ingresos,Ticket Promedio';
    const rows = this.data().map((r) =>
      `${r.salesperson_name},${r.total_sales},${r.total_revenue.toFixed(2)},${r.avg_sale_value.toFixed(2)}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'mejores-vendedores.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
