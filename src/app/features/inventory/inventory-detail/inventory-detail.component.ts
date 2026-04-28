import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { InventoryItem, InventoryMovement, MovementType } from '../../../shared/models/inventory.model';
import { PaginatedResult } from '../../../shared/models/pagination.model';
import { InventoryApiService } from '../services/inventory-api.service';
import { ProductsApiService } from '../../products/services/products-api.service';
import { SuppliersApiService } from '../../suppliers/services/suppliers-api.service';
import { Supplier } from '../../suppliers/models/supplier.model';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NzTagModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSpinModule,
  ],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.less',
})
export class InventoryDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(InventoryApiService);
  private readonly productsApi = inject(ProductsApiService);
  private readonly suppliersApi = inject(SuppliersApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly product_id = signal('');
  readonly product = signal<InventoryItem | null>(null);
  readonly isLoadingProduct = signal(false);

  readonly movements = signal<InventoryMovement[]>([]);
  readonly movementsTotal = signal(0);
  readonly movementsPage = signal(1);
  readonly isLoadingMovements = signal(false);

  readonly submitting = signal(false);
  readonly suppliers = signal<Supplier[]>([]);

  readonly adjustForm = this.fb.group({
    movement_type: ['IN' as MovementType, Validators.required],
    quantity: [1, [Validators.required, Validators.min(1)]],
    notes: [''],
    supplier_id: [null as string | null],
  });

  readonly movementOptions: { value: MovementType; label: string }[] = [
    { value: 'IN', label: 'Entrada (compra / reposición)' },
    { value: 'OUT', label: 'Salida (merma / retiro)' },
    { value: 'ADJUSTMENT', label: 'Ajuste manual' },
  ];

  readonly movementLabels: Record<MovementType, string> = {
    IN: 'Entrada',
    OUT: 'Salida',
    ADJUSTMENT: 'Ajuste',
  };

  readonly movementColors: Record<MovementType, string> = {
    IN: 'success',
    OUT: 'error',
    ADJUSTMENT: 'processing',
  };

  get isInMovement(): boolean {
    return this.adjustForm.get('movement_type')?.value === 'IN';
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('productId');
    if (!id) { this.router.navigate(['/inventario']); return; }
    this.product_id.set(id);
    this.loadProduct(id);
    this.loadMovements(id, 1);
    this.suppliersApi.getAll({ limit: 100 }).subscribe({
      next: res => this.suppliers.set(res.data),
    });
  }

  private loadProduct(product_id: string): void {
    this.isLoadingProduct.set(true);
    this.productsApi.getOne(product_id).subscribe({
      next: p => {
        const item: InventoryItem = {
          product_id: p.product_id,
          sku: p.sku,
          name: p.name,
          stock: p.stock,
          min_stock: p.min_stock,
          unit_price: p.unit_price,
          category: p.category,
        };
        this.product.set(item);
        this.isLoadingProduct.set(false);
      },
      error: () => { this.isLoadingProduct.set(false); this.router.navigate(['/inventario']); },
    });
  }

  loadMovements(product_id: string, page: number): void {
    this.isLoadingMovements.set(true);
    this.api.getMovements(product_id, page).subscribe({
      next: (res: PaginatedResult<InventoryMovement>) => {
        this.movements.set(res.data);
        this.movementsTotal.set(res.total);
        this.movementsPage.set(page);
        this.isLoadingMovements.set(false);
      },
      error: () => this.isLoadingMovements.set(false),
    });
  }

  onMovementsPageChange(page: number): void {
    this.loadMovements(this.product_id(), page);
  }

  submitAdjust(): void {
    if (this.adjustForm.invalid) return;
    const v = this.adjustForm.value;
    this.submitting.set(true);

    this.api.adjustStock({
      product_id: this.product_id(),
      movement_type: v.movement_type as MovementType,
      quantity: v.quantity!,
      notes: v.notes?.trim() || undefined,
      supplier_id: v.supplier_id ?? undefined,
    }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.message.success('Stock ajustado correctamente');
        this.adjustForm.reset({ movement_type: 'IN', quantity: 1, notes: '', supplier_id: null });
        this.loadProduct(this.product_id());
        this.loadMovements(this.product_id(), 1);
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.message.error(err?.error?.message ?? 'Error al ajustar el stock');
      },
    });
  }

  stockTagColor(item: InventoryItem): string {
    if (item.stock < item.min_stock) return 'error';
    if (item.stock === item.min_stock) return 'warning';
    return 'success';
  }
}
