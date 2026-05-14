import { Component, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzStepsModule } from 'ng-zorro-antd/steps';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzAutocompleteOptionComponent } from 'ng-zorro-antd/auto-complete';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzMessageService } from 'ng-zorro-antd/message';
import { QuetzalesPipe } from '../../../shared/pipes/quetzales.pipe';
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
  image_url: string | null;
}

interface OrderRow {
  product_id: string;
  product_sku: string;
  product_name: string;
  product_image_url: string | null;
  quantity_ordered: number;
  unit_cost: number;
  min_sale_price: number | null;
  unit_price: number | null;
}

function isProductOption(value: unknown): value is ProductOption {
  return typeof value === 'object' && value !== null && 'product_id' in value;
}

@Component({
  selector: 'app-purchases-new',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzStepsModule, NzFormModule,
    NzInputModule, NzButtonModule, NzInputNumberModule,
    NzTableModule, NzDividerModule, NzAutocompleteModule,
    NzAvatarModule, NzModalModule,
    QuetzalesPipe,
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
              @if (selectedSupplier()) {
                <div style="display:flex;align-items:center;gap:12px;padding:12px;background:#FBF5EF;border-radius:8px;border:1px solid #EDE0D4;margin-bottom:8px">
                  @if (selectedSupplier()!.photo_url) {
                    <nz-avatar [nzSrc]="selectedSupplier()!.photo_url!" [nzSize]="48" />
                  } @else {
                    <nz-avatar [nzText]="selectedSupplier()!.name[0].toUpperCase()" [nzSize]="48"
                      style="background:#C85A1A;color:#fff;font-weight:700" />
                  }
                  <div style="flex:1">
                    <div style="font-weight:600">{{ selectedSupplier()!.name }}</div>
                    @if (selectedSupplier()!.contact_name) {
                      <div style="font-size:12px;color:#8C7B75">{{ selectedSupplier()!.contact_name }}</div>
                    }
                  </div>
                  <button nz-button nzType="link" nzSize="small" (click)="clearSupplier()">Cambiar</button>
                </div>
              } @else {
                <input nz-input
                  [formControl]="supplierSearch"
                  [nzAutocomplete]="supplierAuto"
                  placeholder="Buscar proveedor por nombre..."
                  style="width:100%" />
                <nz-autocomplete #supplierAuto (selectionChange)="onSupplierSelect($event)">
                  @if (isSearchingSuppliers()) {
                    <nz-auto-option nzDisabled>Buscando...</nz-auto-option>
                  }
                  @for (s of supplierOptions(); track s.supplier_id) {
                    <nz-auto-option [nzValue]="s" [nzLabel]="s.name">
                      <div style="display:flex;align-items:center;gap:8px">
                        @if (s.photo_url) {
                          <nz-avatar [nzSrc]="s.photo_url" [nzSize]="24" />
                        } @else {
                          <nz-avatar [nzText]="s.name[0].toUpperCase()" [nzSize]="24"
                            style="background:#C85A1A;color:#fff;font-size:10px" />
                        }
                        <span>{{ s.name }}</span>
                        @if (s.contact_name) {
                          <span style="color:#8C7B75;font-size:12px">· {{ s.contact_name }}</span>
                        }
                      </div>
                    </nz-auto-option>
                  }
                  @if (supplierOptions().length === 0 && !isSearchingSuppliers() && supplierSearch.value && supplierSearch.value.length >= 2) {
                    <nz-auto-option nzDisabled>No se encontraron proveedores</nz-auto-option>
                  }
                </nz-autocomplete>
                <div style="margin-top:6px">
                  <button nz-button nzType="dashed" nzSize="small" (click)="openCreateSupplier()">
                    + Crear nuevo proveedor
                  </button>
                </div>
              }
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

        <!-- Modal: Crear proveedor -->
        <nz-modal
          [(nzVisible)]="createSupplierModal"
          nzTitle="Nuevo proveedor"
          [nzFooter]="null"
          (nzOnCancel)="createSupplierModal = false">
          <ng-container *nzModalContent>
            <form nz-form [formGroup]="newSupplierForm" nzLayout="vertical" (ngSubmit)="saveNewSupplier()">
              <nz-form-item>
                <nz-form-label nzRequired>Nombre</nz-form-label>
                <nz-form-control nzErrorTip="Requerido">
                  <input nz-input formControlName="name" placeholder="Distribuidora El Roble" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Contacto</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="contact_name" />
                </nz-form-control>
              </nz-form-item>
              <nz-form-item>
                <nz-form-label>Teléfono</nz-form-label>
                <nz-form-control>
                  <input nz-input formControlName="phone" />
                </nz-form-control>
              </nz-form-item>
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button nz-button type="button" (click)="createSupplierModal = false">Cancelar</button>
                <button nz-button nzType="primary" [nzLoading]="isSavingSupplier()" [disabled]="newSupplierForm.invalid">
                  Crear
                </button>
              </div>
            </form>
          </ng-container>
        </nz-modal>
      }

      <!-- STEP 1: Productos -->
      @if (currentStep() === 1) {
        <div>
          <h3>Agregar productos</h3>
          <div style="display:grid; gap:8px; margin-bottom:16px">
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
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr auto; gap:8px; align-items:end">
              <div>
                <label style="display:block; margin-bottom:4px">Cantidad</label>
                <nz-input-number [formControl]="step1Fields.controls.qty" [nzMin]="1" [nzStep]="1" style="width:100%"></nz-input-number>
              </div>
              <div>
                <label style="display:block; margin-bottom:4px">Costo unit. (Q)</label>
                <nz-input-number [formControl]="step1Fields.controls.cost" [nzMin]="0.01" [nzPrecision]="2" [nzStep]="0.5" style="width:100%"></nz-input-number>
              </div>
              <div>
                <label style="display:block; margin-bottom:4px">P. mínimo venta (Q)</label>
                <nz-input-number [formControl]="step1Fields.controls.min_sale_price" [nzMin]="0" [nzPrecision]="2" [nzStep]="0.5" nzPlaceHolder="Opcional" style="width:100%"></nz-input-number>
              </div>
              <div>
                <label style="display:block; margin-bottom:4px">P. venta (Q)</label>
                <nz-input-number [formControl]="step1Fields.controls.unit_price" [nzMin]="0" [nzPrecision]="2" [nzStep]="0.5" nzPlaceHolder="Opcional" style="width:100%"></nz-input-number>
              </div>
              <button nz-button nzType="dashed" (click)="addRow()" [disabled]="!canAdd()">
                + Agregar
              </button>
            </div>
            <div style="font-size:12px; color:#888">Los precios de venta se auto-sugieren al ingresar el costo (+20% mínimo, +35% venta). Editables. Si se dejan vacíos, el precio del producto no cambia.</div>
          </div>

          <nz-table [nzData]="rows()" nzSize="small" [nzShowPagination]="false">
            <thead>
              <tr>
                <th nzWidth="48px"></th><th>SKU</th><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>P. Mínimo</th><th>P. Venta</th><th>Subtotal</th><th></th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.product_id; let i = $index) {
                <tr>
                  <td>
                    @if (row.product_image_url) {
                      <nz-avatar [nzSrc]="row.product_image_url" nzShape="square" [nzSize]="36" />
                    } @else {
                      <nz-avatar nzShape="square" [nzSize]="36" nzIcon="shopping" style="background:#EDE0D4;color:#C85A1A" />
                    }
                  </td>
                  <td>{{ row.product_sku }}</td>
                  <td>{{ row.product_name }}</td>
                  <td>{{ row.quantity_ordered }}</td>
                  <td>{{ row.unit_cost | quetzales }}</td>
                  <td>{{ row.min_sale_price != null ? (row.min_sale_price | quetzales) : '—' }}</td>
                  <td>{{ row.unit_price != null ? (row.unit_price | quetzales) : '—' }}</td>
                  <td>{{ row.quantity_ordered * row.unit_cost | quetzales }}</td>
                  <td><button nz-button nzType="link" nzDanger (click)="removeRow(i)">Quitar</button></td>
                </tr>
              }
            </tbody>
          </nz-table>

          <nz-divider></nz-divider>
          <div style="display:flex; justify-content:space-between; align-items:center">
            <strong>Total: {{ totalCost() | quetzales }}</strong>
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
              <tr><th nzWidth="48px"></th><th>SKU</th><th>Producto</th><th>Cantidad</th><th>Costo Unit.</th><th>P. Mínimo</th><th>P. Venta</th><th>Subtotal</th></tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.product_id) {
                <tr>
                  <td>
                    @if (row.product_image_url) {
                      <nz-avatar [nzSrc]="row.product_image_url" nzShape="square" [nzSize]="36" />
                    } @else {
                      <nz-avatar nzShape="square" [nzSize]="36" nzIcon="shopping" style="background:#EDE0D4;color:#C85A1A" />
                    }
                  </td>
                  <td>{{ row.product_sku }}</td>
                  <td>{{ row.product_name }}</td>
                  <td>{{ row.quantity_ordered }}</td>
                  <td>{{ row.unit_cost | quetzales }}</td>
                  <td>{{ row.min_sale_price != null ? (row.min_sale_price | quetzales) : '—' }}</td>
                  <td>{{ row.unit_price != null ? (row.unit_price | quetzales) : '—' }}</td>
                  <td>{{ row.quantity_ordered * row.unit_cost | quetzales }}</td>
                </tr>
              }
            </tbody>
          </nz-table>
          <p><strong>Total de la orden: {{ totalCost() | quetzales }}</strong></p>
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
  readonly supplierOptions = signal<Supplier[]>([]);
  readonly selectedSupplier = signal<Supplier | null>(null);
  readonly isSearchingSuppliers = signal(false);
  readonly productOptions = signal<ProductOption[]>([]);
  readonly rows = signal<OrderRow[]>([]);
  readonly isSaving = signal(false);
  readonly isSavingSupplier = signal(false);

  createSupplierModal = false;

  readonly supplierSearch = this.fb.control('');

  private selectedProduct: ProductOption | null = null;

  step0 = this.fb.group({
    supplier_id: ['', Validators.required],
    notes:       [''],
  });

  newSupplierForm = this.fb.group({
    name:         ['', [Validators.required, Validators.maxLength(150)]],
    contact_name: [''],
    phone:        [''],
  });

  step1Fields = this.fb.group({
    product_search: [''],
    qty:            [1, [Validators.min(1)]],
    cost:           [0, [Validators.min(0.01)]],
    min_sale_price: [null as number | null],
    unit_price:     [null as number | null],
  });

  ngOnInit(): void {
    this.supplierSearch.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((q) => {
        if (!q || q.length < 2) this.supplierOptions.set([]);
      }),
      filter((q): q is string => !!q && q.length >= 2),
      tap(() => this.isSearchingSuppliers.set(true)),
      switchMap((q) => this.suppliersApi.getAll({ search: q, is_active: true, limit: 10 })),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((res) => {
      this.supplierOptions.set(res.data);
      this.isSearchingSuppliers.set(false);
    });

    this.step1Fields.controls.cost.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(cost => {
      if (cost == null || cost <= 0) return;
      this.step1Fields.patchValue({
        min_sale_price: Math.round(cost * 1.2 * 100) / 100,
        unit_price:     Math.round(cost * 1.35 * 100) / 100,
      }, { emitEvent: false });
    });

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
        res.data.map((p) => ({ product_id: p.product_id, sku: p.sku, name: p.name, image_url: p.image_url })),
      ),
    );
  }

  onSupplierSelect(option: NzAutocompleteOptionComponent): void {
    const s = option.nzValue as Supplier;
    this.selectedSupplier.set(s);
    this.step0.patchValue({ supplier_id: s.supplier_id });
    this.supplierOptions.set([]);
  }

  clearSupplier(): void {
    this.selectedSupplier.set(null);
    this.step0.patchValue({ supplier_id: '' });
    this.supplierSearch.setValue('');
  }

  openCreateSupplier(): void {
    this.newSupplierForm.reset({ name: '', contact_name: '', phone: '' });
    this.createSupplierModal = true;
  }

  saveNewSupplier(): void {
    if (this.newSupplierForm.invalid) return;
    this.isSavingSupplier.set(true);
    const raw = this.newSupplierForm.getRawValue();
    this.suppliersApi.create({
      name: raw.name!,
      contact_name: raw.contact_name || undefined,
      phone: raw.phone || undefined,
    }).subscribe({
      next: (s) => {
        this.selectedSupplier.set(s);
        this.step0.patchValue({ supplier_id: s.supplier_id });
        this.createSupplierModal = false;
        this.isSavingSupplier.set(false);
        this.msg.success('Proveedor creado');
      },
      error: () => { this.msg.error('Error al crear proveedor'); this.isSavingSupplier.set(false); },
    });
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
    const qty            = this.step1Fields.controls.qty.value!;
    const cost           = this.step1Fields.controls.cost.value!;
    const min_sale_price = this.step1Fields.controls.min_sale_price.value;
    const unit_price     = this.step1Fields.controls.unit_price.value;
    this.rows.update((list) => [
      ...list,
      {
        product_id:        this.selectedProduct!.product_id,
        product_sku:       this.selectedProduct!.sku,
        product_name:      this.selectedProduct!.name,
        product_image_url: this.selectedProduct!.image_url,
        quantity_ordered:  qty,
        unit_cost:         cost,
        min_sale_price,
        unit_price,
      },
    ]);
    this.step1Fields.reset(
      { product_search: '', qty: 1, cost: 0, min_sale_price: null, unit_price: null },
      { emitEvent: false },
    );
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
    return this.selectedSupplier()?.name ?? '';
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
        ...(r.min_sale_price != null ? { min_sale_price: r.min_sale_price } : {}),
        ...(r.unit_price     != null ? { unit_price:     r.unit_price     } : {}),
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
