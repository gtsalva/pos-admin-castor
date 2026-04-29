import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzFormModule } from 'ng-zorro-antd/form';
import { SalesStateService } from '../services/sales-state.service';
import { SaleQuery } from '../../../shared/models/sale.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-sales-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSelectModule,
    NzDatePickerModule,
    NzIconModule,
    NzSpaceModule,
    NzFormModule,
    PageHeaderComponent,
  ],
  providers: [SalesStateService],
  templateUrl: './sales-list.component.html',
  styleUrl: './sales-list.component.less',
})
export class SalesListComponent implements OnInit {
  readonly state = inject(SalesStateService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly filterForm: FormGroup = this.fb.group({
    status: [null],
    payment_method: [null],
    from_date: [null],
    to_date: [null],
  });

  ngOnInit(): void {
    this.state.load();
  }

  applyFilters(): void {
    const v = this.filterForm.value as {
      status: string | null;
      payment_method: string | null;
      from_date: Date | null;
      to_date: Date | null;
    };
    const filters: Partial<SaleQuery> = {};
    if (v.status) filters.status = v.status as SaleQuery['status'];
    if (v.payment_method) filters.payment_method = v.payment_method as SaleQuery['payment_method'];
    if (v.from_date) filters.from_date = (v.from_date as Date).toISOString().split('T')[0];
    if (v.to_date) filters.to_date = (v.to_date as Date).toISOString().split('T')[0];
    this.state.setFilters(filters);
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.state.setFilters({});
  }

  viewDetail(sale_id: string): void {
    this.router.navigate(['/ventas', sale_id]);
  }

  readonly paymentLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };
}
