import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductsApiService } from '../services/products-api.service';
import { CategoriesApiService, Category } from '../services/categories-api.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzSelectModule,
    NzButtonModule,
    NzBreadCrumbModule,
    NzSpinModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.less',
})
export class ProductFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApiService);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly productId = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly isLoading = signal(false);
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);

  readonly form = this.fb.group({
    sku:            ['', [Validators.required, Validators.minLength(2)]],
    name:           ['', [Validators.required, Validators.minLength(2)]],
    description:    [''],
    unit_price:     [0, [Validators.required, Validators.min(0)]],
    cost_price:     [null as number | null],
    min_sale_price: [null as number | null],
    stock:          [0, [Validators.required, Validators.min(0)]],
    min_stock:      [0],
    category_id:    [null as string | null],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.productId.set(id);
    this.isEdit.set(!!id);

    this.categoriesApi.getAll().subscribe(cats => this.categories.set(cats));

    if (id) {
      this.isLoading.set(true);
      this.form.get('stock')!.disable();
      this.api.getOne(id).subscribe({
        next: p => {
          this.form.patchValue({
            sku: p.sku,
            name: p.name,
            description: p.description ?? '',
            unit_price: p.unit_price,
            cost_price: p.cost_price,
            min_sale_price: p.min_sale_price,
            min_stock: p.min_stock,
            category_id: p.category_id,
          });
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
          this.router.navigate(['/productos']);
        },
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.submitting.set(true);

    const request$ = this.isEdit()
      ? this.api.update(this.productId()!, {
          sku: v.sku!,
          name: v.name!,
          description: v.description || undefined,
          unit_price: v.unit_price!,
          cost_price: v.cost_price ?? undefined,
          min_sale_price: v.min_sale_price ?? undefined,
          min_stock: v.min_stock ?? undefined,
          category_id: v.category_id ?? undefined,
        })
      : this.api.create({
          sku: v.sku!,
          name: v.name!,
          description: v.description || undefined,
          unit_price: v.unit_price!,
          cost_price: v.cost_price ?? undefined,
          min_sale_price: v.min_sale_price ?? undefined,
          stock: v.stock!,
          min_stock: v.min_stock ?? undefined,
          category_id: v.category_id ?? undefined,
        });

    request$.subscribe({
      next: p => {
        this.submitting.set(false);
        this.message.success(this.isEdit() ? 'Producto actualizado' : 'Producto creado');
        this.router.navigate(['/productos', p.product_id]);
      },
      error: (err: { error?: { message?: string } }) => {
        this.submitting.set(false);
        this.message.error(err?.error?.message ?? 'Error al guardar el producto');
      },
    });
  }

  cancel(): void {
    const id = this.productId();
    this.router.navigate(id ? ['/productos', id] : ['/productos']);
  }
}
