import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAutocompleteOptionComponent } from 'ng-zorro-antd/auto-complete';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CurrencyPipe } from '@angular/common';
import { debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SuppliersApiService } from '../../suppliers/services/suppliers-api.service';
import { PurchasesApiService } from '../services/purchases-api.service';
import { ProductsApiService } from '../../products/services/products-api.service';
import { Supplier } from '../../suppliers/models/supplier.model';

interface ProductOption {
  product_id: string;
  sku: string;
  name: string;
}

interface OrderRow {
  product_id: string;
  product_sku: string;
  product_name: string;
  quantity_ordered: number;
  unit_cost: number;
}

function isProductOption(value: unknown): value is ProductOption {
  return typeof value === 'object' && value !== null && 'product_id' in value;
}

@Component({
  selector: 'app-purchases-new',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzStepsModule, NzFormModule, NzSelectModule,
    NzInputModule, NzButtonModule, NzInputNumberModule,
    NzTableModule, NzDividerModule, NzAutocompleteModule,
    CurrencyPipe,
  ],
  template: `
    <div style="padding:24px; max-width:900px">
      <h2>Nueva Orden de Compra</h2>

      <nz-steps [nzCurrent]="currentStep()" style="margin-bottom:32px">
        <nz-step nzTitle="Proveedor"></nz-step>
        <nz-step nzTitle="Productos"></nz-step>
        <nz-step nzTitle="Confirmar"></nz-step>
      </nz-steps>

      <!-- STEP 0: Proveedor -->
      @if (currentStep() === 0) {
        <form nz-form [formGroup]="step0" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Proveedor</nz-form-label>
            <nz-form-control nzErrorTip="Selecciona un proveedor">
              <nz-select formControlName="supplier_id" nzShowSearch nzPlaceHolder="Seleccionar proveedor" style="width:100%">
                @for (s of suppliers(); track s.supplier_id) {
                  <nz-option [nzValue]="s.supplier_id" [nzLabel]="s.name"></nz-option>
                }
              </nz-select>
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label>Notas (opcional)</nz-form-label>
            <nz-form-control>
              <textarea nz-input formControlName="notes" [nzAutosize]="{ minRows:2 }"></textarea>
            </nz-form-control>
          </nz-form-item>
          <button nz-button nzType="primary" [disabled]="step0.invalid" (click)="nextStep()">
            Siguiente →
          </button>
        </form>
      }

      <!-- STEP 1: Productos -->
      @if (currentStep() === 1) {
        <div>
          <h3>Agregar productos</h3>
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr auto; gap:8px; align-items:end; margin-bottom:16px">
            <div>
              <label style="display:block; margin-bottom:4px">Buscar producto (SKU o nombre)</label>
              <input nz-input
                [formControl]="step1Fields.controls.product_search"
                [nzAutocomplete]="auto"
                (input)="onSearchInput()"
                placeholder="Escribe para buscar..." />
              <nz-autocomplete #auto (selectionChange)="onProductSelect($event)">
                @for (p of productOptions(); track p.product_id) {
                  <nz-auto-option [nzValue]="p" [nzLabel]="p.sku + ' — ' + p.name">
                    {{ p.sku }} — {{ p.name }}
                  </nz-auto-option>
                }
              </nz-autocomplete>
            </div>
            <div>
              <label style="display:block; margin-bottom:4px">Cantidad</label>
              <nz-input-number [formControl]="step1Fields.controls.qty" [nzMin]="1" [nzStep]="1" style="width:100%"></nz-input-number>
            </div>
            <div>
              <label style="display:block; margin-bottom:4px">Costo unit. (Q)</label>
              <nz-input-number [formControl]="step1Fields.controls.cost" [nzMin]="0.01" [nzPrecision]="2" [nzStep]="0.5" style="width:100%"></nz-input-number>
            </div>
            <button nz-button nzType="dashed" (click)="addRow()" [disabled]="!canAdd()">
              + Agregar
            </button>
          </div>

          <nz-table [nzData]="rows()" nzSize="small" [nzShowPagination]="false">
            <thead>
              <tr>
                <th>SKU</th><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>Subtotal</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.product_id; let i = $index) {
                <tr>
                  <td>{{ row.product_sku }}</td>
                  <td>{{ row.product_name }}</td>
                  <td>{{ row.quantity_ordered }}</td>
                  <td>{{ row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                  <td>{{ row.quantity_ordered * row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                  <td><button nz-button nzType="link" nzDanger (click)="removeRow(i)">Quitar</button></td>
                </tr>
              }
            </tbody>
          </nz-table>

          <nz-divider></nz-divider>
          <div style="display:flex; justify-content:space-between; align-items:center">
            <strong>Total: {{ totalCost() | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</strong>
            <div style="display:flex; gap:8px">
              <button nz-button (click)="prevStep()">← Anterior</button>
              <button nz-button nzType="primary" [disabled]="rows().length === 0" (click)="nextStep()">Siguiente →</button>
            </div>
          </div>
        </div>
      }

      <!-- STEP 2: Confirmar -->
      @if (currentStep() === 2) {
        <div>
          <h3>Resumen de la orden</h3>
          <p><strong>Proveedor:</strong> {{ supplierName() }}</p>
          @if (step0.value.notes) {
            <p><strong>Notas:</strong> {{ step0.value.notes }}</p>
          }
          <nz-table [nzData]="rows()" nzSize="small" [nzShowPagination]="false" style="margin:16px 0">
            <thead>
              <tr><th>SKU</th><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.product_id) {
                <tr>
                  <td>{{ row.product_sku }}</td>
                  <td>{{ row.product_name }}</td>
                  <td>{{ row.quantity_ordered }}</td>
                  <td>{{ row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                  <td>{{ row.quantity_ordered * row.unit_cost | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</td>
                </tr>
              }
            </tbody>
          </nz-table>
          <p><strong>Total de la orden: {{ totalCost() | currency:'GTQ':'symbol':'1.2-2':'es-GT' }}</strong></p>
          <div style="display:flex; gap:8px">
            <button nz-button (click)="prevStep()">← Anterior</button>
            <button nz-button nzType="primary" [nzLoading]="isSaving()" (click)="submit()">
              Crear orden
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class PurchasesNewComponent implements OnInit {
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly purchasesApi = inject(PurchasesApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly router = inject(Router);
  private readonly msg = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentStep = signal(0);
  readonly suppliers = signal<Supplier[]>([]);
  readonly productOptions = signal<ProductOption[]>([]);
  readonly rows = signal<OrderRow[]>([]);
  readonly isSaving = signal(false);

  private selectedProduct: ProductOption | null = null;

  step0 = this.fb.group({
    supplier_id: ['', Validators.required],
    notes:       [''],
  });

  step1Fields = this.fb.group({
    product_search: [''],
    qty:            [1, [Validators.min(1)]],
    cost:           [0, [Validators.min(0.01)]],
  });

  ngOnInit(): void {
    this.suppliersApi.getAll({ is_active: true, limit: 100 }).subscribe((res) =>
      this.suppliers.set(res.data),
    );

    this.step1Fields.controls.product_search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((q) => {
        if (!q || q.length < 2) this.productOptions.set([]);
      }),
      filter((q): q is string => !!q && q.length >= 2),
      switchMap((q) => this.productsApi.getAll({ search: q, limit: 10 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((res) =>
      this.productOptions.set(
        res.data.map((p) => ({ product_id: p.product_id, sku: p.sku, name: p.name })),
      ),
    );
  }

  onSearchInput(): void {
    this.selectedProduct = null;
  }

  onProductSelect(option: NzAutocompleteOptionComponent): void {
    const value: unknown = option.nzValue;
    if (!isProductOption(value)) return;
    this.selectedProduct = value;
    this.step1Fields.controls.product_search.setValue(
      `${value.sku} — ${value.name}`,
      { emitEvent: false },
    );
  }

  canAdd(): boolean {
    const qty = this.step1Fields.controls.qty.value ?? 0;
    const cost = this.step1Fields.controls.cost.value ?? 0;
    return !!(this.selectedProduct && qty >= 1 && cost > 0);
  }

  addRow(): void {
    if (!this.canAdd()) return;
    const qty = this.step1Fields.controls.qty.value!;
    const cost = this.step1Fields.controls.cost.value!;
    this.rows.update((list) => [
      ...list,
      {
        product_id:       this.selectedProduct!.product_id,
        product_sku:      this.selectedProduct!.sku,
        product_name:     this.selectedProduct!.name,
        quantity_ordered: qty,
        unit_cost:        cost,
      },
    ]);
    this.step1Fields.reset({ product_search: '', qty: 1, cost: 0 }, { emitEvent: false });
    this.selectedProduct = null;
    this.productOptions.set([]);
  }

  removeRow(index: number): void {
    this.rows.update((list) => list.filter((_, i) => i !== index));
  }

  totalCost(): number {
    return this.rows().reduce((s, r) => s + r.quantity_ordered * r.unit_cost, 0);
  }

  supplierName(): string {
    const id = this.step0.value.supplier_id;
    return this.suppliers().find((s) => s.supplier_id === id)?.name ?? '';
  }

  nextStep(): void { this.currentStep.update((s) => s + 1); }
  prevStep(): void { this.currentStep.update((s) => s - 1); }

  submit(): void {
    this.isSaving.set(true);
    const payload = {
      supplier_id: this.step0.value.supplier_id!,
      notes:       this.step0.value.notes || undefined,
      items: this.rows().map((r) => ({
        product_id:       r.product_id,
        quantity_ordered: r.quantity_ordered,
        unit_cost:        r.unit_cost,
      })),
    };
    this.purchasesApi.create(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (po) => {
          this.msg.success(`Orden ${po.order_number} creada`);
          this.router.navigate(['/compras', po.purchase_order_id]);
        },
        error: () => {
          this.msg.error('Error al crear la orden');
          this.isSaving.set(false);
        },
      });
  }
}
