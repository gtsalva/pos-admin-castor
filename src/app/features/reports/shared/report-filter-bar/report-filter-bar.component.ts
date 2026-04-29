import { Component, input, output, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { Category } from '../../../categories/models/category.model';
import { CategoriesAdminApiService } from '../../../categories/services/categories-api.service';

export interface FilterBarConfig {
  showCategory?: boolean;
  showLimit?: boolean;
  showPeriod?: boolean;
  showPaymentMethod?: boolean;
  showMinMargin?: boolean;
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

@Component({
  selector: 'app-report-filter-bar',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzDatePickerModule,
    NzSelectModule,
    NzFormModule,
    NzButtonModule,
    NzGridModule,
    NzIconModule,
    NzInputNumberModule,
  ],
  template: `
    <div class="filter-bar">
      <form [formGroup]="form" (ngSubmit)="apply()">
        <nz-row [nzGutter]="[12, 8]" nzAlign="middle">

          <nz-col [nzSpan]="6">
            <label class="filter-label">Período</label>
            <nz-range-picker
              formControlName="dateRange"
              nzFormat="dd/MM/yyyy"
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
  `],
})
export class ReportFilterBarComponent implements OnInit {
  config = input<FilterBarConfig>({});
  filtersChange = output<FilterBarValues>();

  private fb = inject(FormBuilder);
  private categoriesApi = inject(CategoriesAdminApiService);

  categories = signal<Category[]>([]);

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
  }

  apply(): void {
    const v = this.form.value;
    const filters: FilterBarValues = {};
    if (v.dateRange?.[0]) filters.date_from = (v.dateRange[0] as Date).toISOString().split('T')[0];
    if (v.dateRange?.[1]) filters.date_to = (v.dateRange[1] as Date).toISOString().split('T')[0];
    if (v.category_id) filters.category_id = v.category_id;
    if (v.limit) filters.limit = v.limit;
    if (v.period) filters.period = v.period;
    if (v.payment_method) filters.payment_method = v.payment_method;
    if (v.min_margin_pct !== null) filters.min_margin_pct = v.min_margin_pct;
    this.filtersChange.emit(filters);
  }

  reset(): void {
    this.form.reset({ limit: 10, period: 'day' });
    this.filtersChange.emit({});
  }
}
