import { Component, input, output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { Category } from '../../../categories/models/category.model';
import { CategoriesAdminApiService } from '../../../categories/services/categories-api.service';
import { IncentivesApiService } from '../../../incentives/services/incentives-api.service';
import { IncentivePeriod } from '../../../incentives/models/incentive.model';

export interface FilterBarConfig {
  showCategory?: boolean;
  showLimit?: boolean;
  showPeriod?: boolean;
  showPaymentMethod?: boolean;
  showMinMargin?: boolean;
  showIncentivePeriod?: boolean;
}

export interface FilterBarValues {
  date_from?: string;
  date_to?: string;
  category_id?: string;
  limit?: number;
  period?: string;
  payment_method?: string;
  min_margin_pct?: number;
}

const PRESETS = [
  { label: 'Hoy',           value: 'today' },
  { label: 'Esta semana',   value: 'week'  },
  { label: 'Este mes',      value: 'month' },
  { label: 'Últ. 30d',      value: '30d'   },
  { label: 'Últ. trimestre', value: '90d'  },
] as const;

type PresetValue = typeof PRESETS[number]['value'];

@Component({
  selector: 'app-report-filter-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule, FormsModule,
    NzDatePickerModule,
    NzSelectModule,
    NzFormModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputNumberModule,
    NzDividerModule,
    NzTagModule,
  ],
  template: `
    <div class="filter-bar">

      <!-- Shortcuts row -->
      <div class="shortcuts-row">
        <div class="presets">
          @for (p of PRESETS; track p.value) {
            <button nz-button
              [nzType]="activePreset === p.value ? 'primary' : 'default'"
              nzSize="small"
              type="button"
              (click)="onPresetChange(p.value)">
              {{ p.label }}
            </button>
          }
        </div>

        @if (config().showIncentivePeriod) {
          <div class="period-selector">
            <span class="period-icon">⚡</span>
            <nz-select
              [(ngModel)]="activePeriodId"
              (ngModelChange)="onPeriodChange($event)"
              nzPlaceHolder="Por período de incentivo"
              nzAllowClear
              style="width: 270px">
              @for (p of periods; track p.period_id) {
                <nz-option [nzValue]="p.period_id" [nzLabel]="periodLabel(p)" />
              }
              @if (periods.length === 0) {
                <nz-option nzDisabled nzValue="" nzLabel="Sin períodos registrados" />
              }
            </nz-select>
          </div>
        }
      </div>

      <nz-divider style="margin: 10px 0 12px" />

      <!-- Filters row -->
      <form [formGroup]="form" (ngSubmit)="apply()">
        <nz-row [nzGutter]="[12, 8]" nzAlign="middle">

          <nz-col [nzSpan]="6">
            <label class="filter-label">Rango de fechas</label>
            <nz-range-picker
              formControlName="dateRange"
              nzFormat="dd/MM/yyyy"
              (nzOnCalendarChange)="onManualDateChange()"
              style="width:100%"
            />
          </nz-col>

          @if (config().showCategory) {
            <nz-col [nzSpan]="4">
              <label class="filter-label">Categoría</label>
              <nz-select formControlName="category_id" nzPlaceHolder="Todas" nzAllowClear style="width:100%">
                @for (cat of categories(); track cat.category_id) {
                  <nz-option [nzValue]="cat.category_id" [nzLabel]="cat.name" />
                }
              </nz-select>
            </nz-col>
          }

          @if (config().showLimit) {
            <nz-col [nzSpan]="3">
              <label class="filter-label">Top N</label>
              <nz-input-number formControlName="limit" [nzMin]="1" [nzMax]="50" style="width:100%" />
            </nz-col>
          }

          @if (config().showPeriod) {
            <nz-col [nzSpan]="3">
              <label class="filter-label">Agrupación</label>
              <nz-select formControlName="period" style="width:100%">
                <nz-option nzValue="day" nzLabel="Día" />
                <nz-option nzValue="week" nzLabel="Semana" />
                <nz-option nzValue="month" nzLabel="Mes" />
              </nz-select>
            </nz-col>
          }

          @if (config().showPaymentMethod) {
            <nz-col [nzSpan]="3">
              <label class="filter-label">Método de pago</label>
              <nz-select formControlName="payment_method" nzPlaceHolder="Todos" nzAllowClear style="width:100%">
                <nz-option nzValue="CASH" nzLabel="Efectivo" />
                <nz-option nzValue="CARD" nzLabel="Tarjeta" />
                <nz-option nzValue="TRANSFER" nzLabel="Transferencia" />
              </nz-select>
            </nz-col>
          }

          @if (config().showMinMargin) {
            <nz-col [nzSpan]="3">
              <label class="filter-label">Margen mín. %</label>
              <nz-input-number
                formControlName="min_margin_pct"
                [nzMin]="0"
                [nzMax]="100"
                nzPlaceHolder="0"
                style="width:100%"
              />
            </nz-col>
          }

          <nz-col [nzSpan]="3" style="padding-top:18px">
            <button nz-button nzType="primary" nzBlock type="submit">
              <span nz-icon nzType="search"></span> Aplicar
            </button>
          </nz-col>

          <nz-col [nzSpan]="2" style="padding-top:18px">
            <button nz-button nzType="default" nzBlock type="button" (click)="reset()">
              Limpiar
            </button>
          </nz-col>

        </nz-row>
      </form>
    </div>
  `,
  styles: [`
    .filter-bar {
      background: #fff;
      border: 1px solid #EDE0D4;
      border-radius: 12px;
      padding: 16px 20px 8px;
      margin-bottom: 20px;
    }
    .filter-label {
      display: block;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #8C7B75;
      margin-bottom: 4px;
    }
    .shortcuts-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 8px;
    }
    .presets {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }
    .period-selector {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .period-icon {
      font-size: 14px;
      color: #C85A1A;
    }
  `],
})
export class ReportFilterBarComponent implements OnInit {
  config = input<FilterBarConfig>({});
  filtersChange = output<FilterBarValues>();

  private fb = inject(FormBuilder);
  private categoriesApi = inject(CategoriesAdminApiService);
  private incentivesApi = inject(IncentivesApiService);

  categories = signal<Category[]>([]);
  periods: IncentivePeriod[] = [];

  activePreset: PresetValue | null = null;
  activePeriodId: string | null = null;
  readonly PRESETS = PRESETS;

  private applyingShortcut = false;

  form: FormGroup = this.fb.group({
    dateRange: [null],
    category_id: [null],
    limit: [10],
    period: ['day'],
    payment_method: [null],
    min_margin_pct: [null],
  });

  ngOnInit(): void {
    if (this.config().showCategory) {
      this.categoriesApi.getAll().subscribe((cats) => this.categories.set(cats));
    }
    if (this.config().showIncentivePeriod) {
      this.incentivesApi.getPeriods().subscribe((ps) => { this.periods = ps; });
    }
    this.onPresetChange('month');
  }

  onPresetChange(preset: PresetValue): void {
    this.activePreset = preset;
    this.activePeriodId = null;
    this.applyingShortcut = true;
    this.form.get('dateRange')!.setValue(this.presetRange(preset));
    this.applyingShortcut = false;
    this.apply();
  }

  onPeriodChange(periodId: string | null): void {
    this.activePeriodId = periodId;
    this.activePreset = null;
    if (!periodId) {
      this.applyingShortcut = true;
      this.form.get('dateRange')!.setValue(null);
      this.applyingShortcut = false;
      this.apply();
      return;
    }
    const p = this.periods.find((x) => x.period_id === periodId);
    if (!p) return;
    this.applyingShortcut = true;
    this.form.get('dateRange')!.setValue([
      new Date(p.start_date + 'T00:00:00'),
      new Date(p.end_date + 'T00:00:00'),
    ]);
    this.applyingShortcut = false;
    this.apply();
  }

  onManualDateChange(): void {
    if (this.applyingShortcut) return;
    this.activePreset = null;
    this.activePeriodId = null;
  }

  apply(): void {
    const v = this.form.value;
    const filters: FilterBarValues = {};
    if (v.dateRange?.[0]) filters.date_from = this.toDateStr(v.dateRange[0] as Date);
    if (v.dateRange?.[1]) filters.date_to = this.toDateStr(v.dateRange[1] as Date);
    if (v.category_id) filters.category_id = v.category_id;
    if (v.limit) filters.limit = v.limit;
    if (this.config().showPeriod && v.period) filters.period = v.period;
    if (v.payment_method) filters.payment_method = v.payment_method;
    if (v.min_margin_pct !== null) filters.min_margin_pct = v.min_margin_pct;
    this.filtersChange.emit(filters);
  }

  reset(): void {
    this.activePreset = null;
    this.activePeriodId = null;
    this.form.reset({ limit: 10, period: 'day' });
    this.filtersChange.emit({});
  }

  periodLabel(p: IncentivePeriod): string {
    return `${p.name}  (${this.fmtDate(p.start_date)} – ${this.fmtDate(p.end_date)})`;
  }

  private toDateStr(d: Date): string {
    return d.toISOString().split('T')[0];
  }

  private fmtDate(s: string): string {
    const d = new Date(s + 'T00:00:00');
    return `${d.getDate()}/${d.getMonth() + 1}/${String(d.getFullYear()).slice(2)}`;
  }

  private presetRange(preset: string): [Date, Date] {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    switch (preset) {
      case 'today':
        return [new Date(start), end];
      case 'week': {
        const day = start.getDay();
        start.setDate(start.getDate() - (day === 0 ? 6 : day - 1));
        return [start, end];
      }
      case 'month':
        start.setDate(1);
        return [start, end];
      case '30d':
        start.setDate(start.getDate() - 29);
        return [start, end];
      case '90d':
        start.setDate(start.getDate() - 89);
        return [start, end];
      default:
        return [start, end];
    }
  }
}
