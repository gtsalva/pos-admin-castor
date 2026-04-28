import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzModalService } from 'ng-zorro-antd/modal';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PurchasesApiService } from '../services/purchases-api.service';
import { PurchaseOrder, PurchaseStatus } from '../models/purchase.model';

const STATUS_COLOR: Record<PurchaseStatus, string> = {
  PENDING: 'orange', RECEIVED: 'green', CANCELLED: 'default',
};
const STATUS_LABEL: Record<PurchaseStatus, string> = {
  PENDING: 'Pendiente', RECEIVED: 'Recibida', CANCELLED: 'Cancelada',
};

@Component({
  selector: 'app-purchases-detail',
  standalone: true,
  imports: [
    RouterLink,
    NzDescriptionsModule, NzTableModule, NzTagModule,
    NzButtonModule, NzSpinModule, NzPopconfirmModule, NzInputModule,
    CurrencyPipe, DatePipe, FormsModule,
  ],
  template: `
    <div style="padding:24px">
      @if (isLoading()) {
        <nz-spin nzSimple></nz-spin>
      } @else if (po()) {
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
          <div>
            <a routerLink="/compras">← Órdenes de compra</a>
            <h2 style="margin:8px 0 0">{{ po()!.order_number }}</h2>
          </div>
          <div style="display:flex; gap:8px">
            @if (po()!.status === 'PENDING') {
              <a nz-button nzType="primary" [routerLink]="['recibir']">Recibir mercadería</a>
              <button nz-button nzDanger
                nz-popconfirm
                nzPopconfirmTitle="¿Está seguro de cancelar esta orden?"
                nzPopconfirmPlacement="bottomRight"
                (nzOnConfirm)="openCancelModal()">
                Cancelar orden
              </button>
            }
          </div>
        </div>

        <nz-descriptions nzBordered nzSize="small" [nzColumn]="3" style="margin-bottom:24px">
          <nz-descriptions-item nzTitle="Estado">
            <nz-tag [nzColor]="statusColor(po()!.status)">{{ statusLabel(po()!.status) }}</nz-tag>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Proveedor">{{ po()!.supplier?.name }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Total">
            <strong>{{ po()!.total_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</strong>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Creada por">{{ po()!.ordered_by_user?.name }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Fecha de creación">{{ po()!.created_at | date:'dd/MM/yyyy HH:mm' }}</nz-descriptions-item>
          @if (po()!.received_at) {
            <nz-descriptions-item nzTitle="Fecha de recepción">{{ po()!.received_at | date:'dd/MM/yyyy HH:mm' }}</nz-descriptions-item>
            <nz-descriptions-item nzTitle="Recibida por">{{ po()!.received_by_user?.name }}</nz-descriptions-item>
          }
          @if (po()!.cancellation_reason) {
            <nz-descriptions-item nzTitle="Motivo cancelación" [nzSpan]="3">
              {{ po()!.cancellation_reason }}
            </nz-descriptions-item>
          }
          @if (po()!.notes) {
            <nz-descriptions-item nzTitle="Notas" [nzSpan]="3">{{ po()!.notes }}</nz-descriptions-item>
          }
        </nz-descriptions>

        <h3>Ítems de la orden</h3>
        <nz-table [nzData]="po()!.items" nzSize="small" [nzShowPagination]="false">
          <thead>
            <tr>
              <th>SKU</th><th>Producto</th>
              <th>Cant. Ordenada</th><th>Cant. Recibida</th>
              <th>Costo Unit.</th><th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            @for (item of po()!.items; track item.purchase_item_id) {
              <tr>
                <td>{{ item.product_sku }}</td>
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity_ordered }}</td>
                <td>{{ item.quantity_received ?? '—' }}</td>
                <td>{{ item.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                <td>{{ item.subtotal | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
              </tr>
            }
          </tbody>
        </nz-table>
      }
    </div>
  `,
})
export class PurchasesDetailComponent implements OnInit {
  readonly purchaseId = input.required<string>();

  private readonly api = inject(PurchasesApiService);
  private readonly modal = inject(NzModalService);
  private readonly msg = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly po = signal<PurchaseOrder | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getOne(this.purchaseId()).subscribe({
      next: (po) => { this.po.set(po); this.isLoading.set(false); },
      error: () => { this.msg.error('Error al cargar la orden'); this.isLoading.set(false); },
    });
  }

  statusColor(s: PurchaseStatus): string { return STATUS_COLOR[s]; }
  statusLabel(s: PurchaseStatus): string { return STATUS_LABEL[s]; }

  openCancelModal(): void {
    let reason = '';
    this.modal.confirm({
      nzTitle: 'Motivo de cancelación',
      nzContent: `<div style="margin-top:8px"><label>Describe el motivo:</label><br/><textarea id="cancel-reason-input" style="width:100%;margin-top:4px;border:1px solid #d9d9d9;border-radius:4px;padding:4px 8px" rows="3"></textarea></div>`,
      nzOnOk: () => {
        reason = (document.getElementById('cancel-reason-input') as HTMLTextAreaElement)?.value ?? '';
        if (!reason.trim()) {
          this.msg.warning('Ingresa el motivo de cancelación');
          return false;
        }
        return new Promise<void>((resolve, reject) => {
          this.api.cancel(this.purchaseId(), reason).subscribe({
            next: (po) => { this.po.set(po); this.msg.success('Orden cancelada'); resolve(); },
            error: () => { this.msg.error('Error al cancelar'); reject(); },
          });
        });
      },
    });
  }
}
