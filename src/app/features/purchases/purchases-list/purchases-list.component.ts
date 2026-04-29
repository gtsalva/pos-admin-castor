import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { DatePipe } from '@angular/common';
import { QuetzalesPipe } from '../../../shared/pipes/quetzales.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PurchasesStateService } from '../services/purchases-state.service';
import { PurchaseStatus } from '../models/purchase.model';

const STATUS_COLOR: Record<PurchaseStatus, string> = {
  PENDING:   'orange',
  RECEIVED:  'green',
  CANCELLED: 'default',
};

const STATUS_LABEL: Record<PurchaseStatus, string> = {
  PENDING:   'Pendiente',
  RECEIVED:  'Recibida',
  CANCELLED: 'Cancelada',
};

@Component({
  selector: 'app-purchases-list',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NzTableModule, NzButtonModule, NzTagModule, NzSelectModule, QuetzalesPipe, DatePipe, PageHeaderComponent],
  template: `
    <div>
      <app-page-header title="Órdenes de Compra">
        <button nz-button nzType="primary" routerLink="nueva">+ Nueva orden</button>
      </app-page-header>

      <div style="margin-bottom:16px">
        <nz-select style="width:180px" [formControl]="statusFilter" nzPlaceHolder="Filtrar por estado" nzAllowClear>
          <nz-option nzValue="PENDING"   nzLabel="Pendiente"></nz-option>
          <nz-option nzValue="RECEIVED"  nzLabel="Recibida"></nz-option>
          <nz-option nzValue="CANCELLED" nzLabel="Cancelada"></nz-option>
        </nz-select>
      </div>

      <nz-table
        [nzData]="state.items()"
        [nzTotal]="state.total()"
        [nzPageIndex]="state.query().page ?? 1"
        [nzPageSize]="20"
        [nzLoading]="state.isLoading()"
        nzShowSizeChanger
        (nzPageIndexChange)="state.setPage($event)">
        <thead>
          <tr>
            <th>N° Orden</th>
            <th>Proveedor</th>
            <th>Estado</th>
            <th>Total</th>
            <th>Creada por</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (row of state.items(); track row.purchase_order_id) {
            <tr>
              <td><strong>{{ row.order_number }}</strong></td>
              <td>{{ row.supplier?.name }}</td>
              <td>
                <nz-tag [nzColor]="statusColor(row.status)">{{ statusLabel(row.status) }}</nz-tag>
              </td>
              <td>{{ row.total_cost | quetzales }}</td>
              <td>{{ row.ordered_by_user?.name }}</td>
              <td>{{ row.created_at | date:'dd/MM/yyyy' }}</td>
              <td>
                <a nz-button nzType="link" [routerLink]="[row.purchase_order_id]">Ver</a>
                @if (row.status === 'PENDING') {
                  <a nz-button nzType="link" [routerLink]="[row.purchase_order_id, 'recibir']">Recibir</a>
                }
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `,
})
export class PurchasesListComponent implements OnInit {
  readonly state = inject(PurchasesStateService);
  private readonly destroyRef = inject(DestroyRef);

  readonly statusFilter = new FormControl<PurchaseStatus | null>(null);

  ngOnInit(): void {
    this.state.load();
    this.statusFilter.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((status) => this.state.filterByStatus(status ?? undefined));
  }

  statusColor(s: PurchaseStatus): string { return STATUS_COLOR[s]; }
  statusLabel(s: PurchaseStatus): string { return STATUS_LABEL[s]; }
}
