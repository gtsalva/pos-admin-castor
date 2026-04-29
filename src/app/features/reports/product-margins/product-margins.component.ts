import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { Chart, registerables } from 'chart.js';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTableSortFn } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ReportsApiService } from '../services/reports-api.service';
import { ProductMarginRow, ProductMarginsFilters } from '../models/report.model';
import { KpiCardComponent } from '../shared/kpi-card/kpi-card.component';
import { ReportFilterBarComponent, FilterBarValues } from '../shared/report-filter-bar/report-filter-bar.component';
import { QuetzalesPipe } from '../../../shared/pipes/quetzales.pipe';

Chart.register(...registerables);

@Component({
  selector: 'app-product-margins',
  standalone: true,
  imports: [
    QuetzalesPipe,
    BaseChartDirective,
    NzGridModule, NzCardModule, NzTableModule, NzTagModule,
    NzSpinModule, NzDividerModule, NzButtonModule, NzIconModule, NzToolTipModule,
    KpiCardComponent, ReportFilterBarComponent,
  ],
  template: `
    <app-report-filter-bar
      [config]="{ showCategory: true, showMinMargin: true }"
      (filtersChange)="onFilters($event)"
    />

    @if (loading()) {
      <nz-spin nzTip="Cargando reporte..." style="display:block;text-align:center;padding:40px" />
    } @else {
      <nz-row [nzGutter]="16" style="margin-bottom:20px">
        <nz-col [nzSpan]="6">
          <app-kpi-card label="Productos analizados" [value]="data().length" accentColor="#C85A1A" />
        </nz-col>
        <nz-col [nzSpan]="6">
          <app-kpi-card
            label="Margen promedio"
            [value]="(avgMargin() | number:'1.1-1') + '%'"
            accentColor="#7BA05B"
          />
        </nz-col>
        <nz-col [nzSpan]="6">
          <app-kpi-card
            label="Mayor margen"
            [value]="(maxMargin() | number:'1.1-1') + '%'"
            accentColor="#4E7FA8"
          />
        </nz-col>
        <nz-col [nzSpan]="6">
          <app-kpi-card
            label="Sin datos de costo"
            [value]="noCostCount()"
            accentColor="#E8A857"
            sub="productos sin precio de costo"
          />
        </nz-col>
      </nz-row>

      <nz-card nzTitle="Top 15 — Margen bruto %" [nzExtra]="exportTpl">
        <div style="height:300px;position:relative">
          <canvas baseChart
            [data]="marginBarData()"
            [options]="marginBarOptions"
            type="bar"
          ></canvas>
        </div>
      </nz-card>

      <nz-divider />

      <nz-card nzTitle="Detalle de márgenes">
        <nz-table
          [nzData]="data()"
          [nzBordered]="false"
          nzSize="middle"
          [nzShowPagination]="data().length > 15"
          [nzPageSize]="15"
        >
          <thead>
            <tr>
              <th>Producto</th>
              <th>SKU</th>
              <th>Categoría</th>
              <th nzAlign="right" [nzSortFn]="sortByCost">Costo</th>
              <th nzAlign="right" [nzSortFn]="sortByPrice">Precio venta</th>
              <th nzAlign="right" [nzSortFn]="sortByMarginAmt">Margen Q</th>
              <th nzAlign="right" [nzSortFn]="sortByMarginPct">Margen %</th>
              <th nzAlign="right">Unidades</th>
            </tr>
          </thead>
          <tbody>
            @for (row of data(); track row.product_id) {
              <tr>
                <td style="font-weight:500">{{ row.product_name }}</td>
                <td><code style="font-size:11px;color:#8C7B75">{{ row.product_sku }}</code></td>
                <td>
                  @if (row.category_name) {
                    <nz-tag>{{ row.category_name }}</nz-tag>
                  } @else { <span style="color:#C4B0A3">—</span> }
                </td>
                <td nzAlign="right">
                  @if (row.cost_price !== null) {
                    <span>{{ row.cost_price | quetzales }}</span>
                  } @else {
                    <span nz-tooltip nzTooltipTitle="Sin precio de costo registrado" style="color:#C4B0A3">—</span>
                  }
                </td>
                <td nzAlign="right">
                  <span>{{ row.sale_price | quetzales }}</span>
                </td>
                <td nzAlign="right">
                  @if (row.margin_amount !== null) {
                    <span [style.color]="row.margin_amount >= 0 ? '#7BA05B' : '#CF1322'" style="font-weight:600">
                      {{ row.margin_amount | quetzales }}
                    </span>
                  } @else { <span style="color:#C4B0A3">—</span> }
                </td>
                <td nzAlign="right">
                  @if (row.margin_pct !== null) {
                    <nz-tag [nzColor]="marginColor(row.margin_pct)">
                      {{ row.margin_pct | number:'1.1-1' }}%
                    </nz-tag>
                  } @else { <span style="color:#C4B0A3">—</span> }
                </td>
                <td nzAlign="right">{{ row.units_sold | number }}</td>
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
export class ProductMarginsComponent implements OnInit {
  private api = inject(ReportsApiService);

  data = signal<ProductMarginRow[]>([]);
  loading = signal(true);

  withMargin = computed(() => this.data().filter((r) => r.margin_pct !== null));
  avgMargin = computed(() => {
    const rows = this.withMargin();
    return rows.length > 0 ? rows.reduce((s, r) => s + r.margin_pct!, 0) / rows.length : 0;
  });
  maxMargin = computed(() => {
    const rows = this.withMargin();
    return rows.length > 0 ? Math.max(...rows.map((r) => r.margin_pct!)) : 0;
  });
  noCostCount = computed(() => this.data().filter((r) => r.cost_price === null).length);

  marginBarData = computed<ChartData<'bar'>>(() => {
    const top15 = this.withMargin().slice(0, 15);
    return {
      labels: top15.map((r) => r.product_name.length > 18 ? r.product_name.slice(0, 18) + '…' : r.product_name),
      datasets: [{
        label: 'Margen %',
        data: top15.map((r) => r.margin_pct!),
        backgroundColor: top15.map((r) =>
          r.margin_pct! >= 50 ? '#7BA05B' : r.margin_pct! >= 20 ? '#E8A857' : '#C85A1A'
        ),
        borderRadius: 6,
        borderSkipped: false,
      }],
    };
  });

  marginBarOptions: ChartOptions<'bar'> = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { color: '#F0E6DB' },
        ticks: { color: '#8C7B75', callback: (v: number | string) => v + '%' },
      },
      y: { grid: { display: false }, ticks: { color: '#3A2820', font: { size: 11 } } },
    },
  };

  readonly sortByCost: NzTableSortFn<ProductMarginRow> = (a: ProductMarginRow, b: ProductMarginRow): number => (a.cost_price ?? 0) - (b.cost_price ?? 0);
  readonly sortByPrice: NzTableSortFn<ProductMarginRow> = (a: ProductMarginRow, b: ProductMarginRow): number => a.sale_price - b.sale_price;
  readonly sortByMarginAmt: NzTableSortFn<ProductMarginRow> = (a: ProductMarginRow, b: ProductMarginRow): number => (a.margin_amount ?? -Infinity) - (b.margin_amount ?? -Infinity);
  readonly sortByMarginPct: NzTableSortFn<ProductMarginRow> = (a: ProductMarginRow, b: ProductMarginRow): number => (a.margin_pct ?? -Infinity) - (b.margin_pct ?? -Infinity);

  marginColor(pct: number): string {
    if (pct >= 50) return 'green';
    if (pct >= 20) return 'gold';
    if (pct >= 0) return 'orange';
    return 'red';
  }

  ngOnInit(): void { this.load({}); }

  onFilters(filters: FilterBarValues): void { this.load(filters as ProductMarginsFilters); }

  private load(filters: ProductMarginsFilters): void {
    this.loading.set(true);
    this.api.getProductMargins(filters).subscribe({
      next: (rows) => { this.data.set(rows); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  exportCsv(): void {
    const headers = 'Producto,SKU,Categoría,Costo,Precio,Margen Dollar,Margen Pct,Unidades';
    const rows = this.data().map((r) =>
      `"${r.product_name}",${r.product_sku},"${r.category_name ?? ''}",` +
      `${r.cost_price ?? ''},${r.sale_price},${r.margin_amount ?? ''},${r.margin_pct ?? ''},${r.units_sold}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'margenes-producto.csv'; a.click();
    URL.revokeObjectURL(url);
  }
}
