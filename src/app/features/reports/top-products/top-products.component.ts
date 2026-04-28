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
import { NzSegmentedModule } from 'ng-zorro-antd/segmented';
import { ReportsApiService } from '../services/reports-api.service';
import { TopProductRow, TopProductsFilters } from '../models/report.model';
import { KpiCardComponent } from '../shared/kpi-card/kpi-card.component';
import { ReportFilterBarComponent, FilterBarValues } from '../shared/report-filter-bar/report-filter-bar.component';

Chart.register(...registerables);

@Component({
  selector: 'app-top-products',
  standalone: true,
  imports: [
    DecimalPipe,
    BaseChartDirective,
    NzGridModule, NzCardModule, NzTableModule, NzTagModule,
    NzSpinModule, NzDividerModule, NzButtonModule, NzIconModule, NzSegmentedModule,
    KpiCardComponent, ReportFilterBarComponent,
  ],
  template: `
    <app-report-filter-bar
      [config]="{ showCategory: true, showLimit: true }"
      (filtersChange)="onFilters($event)"
    />

    @if (loading()) {
      <nz-spin nzTip="Cargando reporte..." style="display:block;text-align:center;padding:40px" />
    } @else {
      <nz-row [nzGutter]="16" style="margin-bottom:20px">
        <nz-col [nzSpan]="8">
          <app-kpi-card label="Productos distintos" [value]="data().length" accentColor="#C85A1A" />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Unidades totales"
            [value]="(totalUnits() | number) ?? '0'"
            accentColor="#4E7FA8"
          />
        </nz-col>
        <nz-col [nzSpan]="8">
          <app-kpi-card
            label="Ingresos totales"
            [value]="'$' + (totalRevenue() | number:'1.0-0')"
            accentColor="#7BA05B"
          />
        </nz-col>
      </nz-row>

      <nz-card [nzTitle]="chartTitle" [nzExtra]="segmentedTpl">
        <div style="height:300px;position:relative">
          <canvas baseChart
            [data]="barChartData()"
            [options]="barOptions"
            type="bar"
          ></canvas>
        </div>
      </nz-card>

      <nz-divider />

      <nz-card nzTitle="Detalle de productos" [nzExtra]="exportTpl">
        <nz-table
          [nzData]="data()"
          [nzBordered]="false"
          nzSize="middle"
          [nzShowPagination]="data().length > 10"
          [nzPageSize]="10"
        >
          <thead>
            <tr>
              <th>#</th>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th nzAlign="right">Unidades</th>
              <th nzAlign="right">Ingresos</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track row.product_id; let i = $index) {
              <tr>
                <td>{{ i + 1 }}</td>
                <td style="font-weight:500">{{ row.product_name }}</td>
                <td><code style="font-size:11px;color:#8C7B75">{{ row.product_sku }}</code></td>
                <td>
                  @if (row.category_name) {
                    <nz-tag>{{ row.category_name }}</nz-tag>
                  } @else {
                    <span style="color:#C4B0A3">—</span>
                  }
                </td>
                <td nzAlign="right" style="color:#4E7FA8;font-weight:600">{{ row.units_sold | number }}</td>
                <td nzAlign="right" style="color:#7BA05B;font-weight:600">${'$'}{{ row.total_revenue | number:'1.0-2' }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      </nz-card>
    }

    <ng-template #segmentedTpl>
      <nz-segmented
        [nzOptions]="['Unidades', 'Ingresos']"
        (nzValueChange)="viewMode.set(+$event)"
      />
    </ng-template>
    <ng-template #chartTitle>Ranking — {{ viewMode() === 0 ? 'por unidades vendidas' : 'por ingresos' }}</ng-template>
    <ng-template #exportTpl>
      <button nz-button nzSize="small" (click)="exportCsv()">
        <span nz-icon nzType="download"></span> CSV
      </button>
    </ng-template>
  `,
})
export class TopProductsComponent implements OnInit {
  private api = inject(ReportsApiService);

  data = signal<TopProductRow[]>([]);
  loading = signal(true);
  viewMode = signal(0);

  totalUnits = computed(() => this.data().reduce((s, r) => s + r.units_sold, 0));
  totalRevenue = computed(() => this.data().reduce((s, r) => s + r.total_revenue, 0));

  barChartData = computed<ChartData<'bar'>>(() => ({
    labels: this.data().map((r) => r.product_name.length > 20 ? r.product_name.slice(0, 20) + '…' : r.product_name),
    datasets: [{
      label: this.viewMode() === 0 ? 'Unidades' : 'Ingresos',
      data: this.data().map((r) => this.viewMode() === 0 ? r.units_sold : r.total_revenue),
      backgroundColor: this.viewMode() === 0 ? '#4E7FA8' : '#7BA05B',
      borderRadius: 6,
      borderSkipped: false,
    }],
  }));

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#3A2820', maxRotation: 35 } },
      y: { grid: { color: '#F0E6DB' }, ticks: { color: '#8C7B75' } },
    },
  };

  ngOnInit(): void { this.load({}); }

  onFilters(filters: FilterBarValues): void { this.load(filters as TopProductsFilters); }

  private load(filters: TopProductsFilters): void {
    this.loading.set(true);
    this.api.getTopProducts(filters).subscribe({
      next: (rows) => { this.data.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportCsv(): void {
    const headers = 'Producto,SKU,Categoría,Unidades,Ingresos';
    const rows = this.data().map((r) =>
      `"${r.product_name}",${r.product_sku},"${r.category_name ?? ''}",${r.units_sold},${r.total_revenue.toFixed(2)}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'productos-mas-vendidos.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
