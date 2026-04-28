import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyPipe } from '@angular/common';
import { PurchasesApiService } from '../services/purchases-api.service';
import { PurchaseOrder, PurchaseOrderItem } from '../models/purchase.model';

@Component({
  selector: 'app-purchases-receive',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, NzTableModule, NzButtonModule, NzInputNumberModule, NzAlertModule, NzSpinModule, CurrencyPipe],
  template: `
    <div style="padding:24px; max-width:900px">
      @if (isLoading()) {
        <nz-spin nzSimple></nz-spin>
      } @else if (po()) {
        <a [routerLink]="['/compras', purchaseId()]">← {{ po()!.order_number }}</a>
        <h2>Recibir mercadería — {{ po()!.order_number }}</h2>
        <p>Proveedor: <strong>{{ po()!.supplier?.name }}</strong></p>

        <nz-alert nzType="info" nzMessage="Ingresa las cantidades realmente recibidas. El stock se actualizará automáticamente al confirmar." style="margin-bottom:16px"></nz-alert>

        <nz-table [nzData]="rows()" nzSize="small" [nzShowPagination]="false">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Producto</th>
              <th>Cant. Ordenada</th>
              <th>Cant. a Recibir</th>
              <th>Costo Unit.</th>
              <th>Subtotal Recibido</th>
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track row.purchase_item_id; let i = $index) {
              <tr>
                <td>{{ row.product_sku }}</td>
                <td>{{ row.product_name }}</td>
                <td>{{ row.quantity_ordered }}</td>
                <td>
                  <nz-input-number
                    [formControl]="getQtyControl(i)"
                    [nzMin]="0"
                    [nzMax]="row.quantity_ordered"
                    [nzStep]="1"
                    style="width:90px">
                  </nz-input-number>
                </td>
                <td>{{ row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                <td>{{ getQtyControl(i).value * row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
              </tr>
            }
          </tbody>
        </nz-table>

        <div style="margin-top:24px; display:flex; gap:8px; justify-content:flex-end">
          <a nz-button [routerLink]="['/compras', purchaseId()]">Cancelar</a>
          <button nz-button nzType="primary" [nzLoading]="isSaving()" (click)="confirm()">
            Confirmar recepción
          </button>
        </div>
      }
    </div>
  `,
})
export class PurchasesReceiveComponent implements OnInit {
  readonly purchaseId = input.required<string>();

  private readonly api = inject(PurchasesApiService);
  private readonly router = inject(Router);
  private readonly msg = inject(NzMessageService);

  readonly po = signal<PurchaseOrder | null>(null);
  readonly rows = signal<PurchaseOrderItem[]>([]);
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);

  readonly qtyForm = new FormArray<FormControl<number>>([]);

  getQtyControl(i: number): FormControl<number> {
    return this.qtyForm.controls[i];
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.api.getOne(this.purchaseId()).subscribe({
      next: (po) => {
        this.po.set(po);
        this.rows.set(po.items);
        this.qtyForm.clear();
        po.items.forEach((item) => {
          this.qtyForm.push(new FormControl<number>(item.quantity_ordered, { nonNullable: true }));
        });
        this.isLoading.set(false);
      },
      error: () => { this.msg.error('Error al cargar la orden'); this.isLoading.set(false); },
    });
  }

  confirm(): void {
    this.isSaving.set(true);
    const payload = {
      items: this.rows().map((r, i) => ({
        purchase_item_id:  r.purchase_item_id,
        quantity_received: this.qtyForm.controls[i].value,
      })),
    };
    this.api.receive(this.purchaseId(), payload).subscribe({
      next: () => {
        this.msg.success('Mercadería recibida. Inventario actualizado.');
        this.router.navigate(['/compras', this.purchaseId()]);
      },
      error: () => { this.msg.error('Error al confirmar recepción'); this.isSaving.set(false); },
    });
  }
}
