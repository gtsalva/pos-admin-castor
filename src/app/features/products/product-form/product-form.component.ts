import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { ProductsApiService } from '../services/products-api.service';
import { CategoriesApiService, Category } from '../services/categories-api.service';
import { ProductResourcesApiService } from '../services/product-resources-api.service';
import { ProductResource } from '../../../shared/models/product-resource.model';

interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  resource_type: 'image' | 'pdf';
  uploading: boolean;
  uploadedUrl: string | null;
  error: boolean;
}

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule,
    NzFormModule, NzInputModule, NzInputNumberModule, NzSelectModule,
    NzButtonModule, NzBreadCrumbModule, NzSpinModule, NzIconModule,
    NzPopconfirmModule,
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.less',
})
export class ProductFormComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApiService);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly resourcesApi = inject(ProductResourcesApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly productId = signal<string | null>(null);
  readonly isEdit = signal(false);
  readonly isLoading = signal(false);
  readonly submitting = signal(false);
  readonly categories = signal<Category[]>([]);

  readonly existingResources = signal<ProductResource[]>([]);
  readonly queuedFiles = signal<QueuedFile[]>([]);
  readonly deletingId = signal<string | null>(null);
  private _autoCalcActive = false;

  readonly defaultImage = computed(() =>
    this.existingResources().find(r => r.resource_type === 'image') ?? null
  );

  readonly hasUploading = computed(() => this.queuedFiles().some(q => q.uploading));

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

    this.form.get('cost_price')!.valueChanges.subscribe(cost => {
      if (!this._autoCalcActive || cost == null) return;
      this.form.patchValue({
        min_sale_price: Math.round(cost * 1.2 * 100) / 100,
        unit_price:     Math.round(cost * 1.35 * 100) / 100,
      }, { emitEvent: false });
    });

    this.categoriesApi.getAll().subscribe({
      next: cats => this.categories.set(cats),
      error: () => this.message.error('No se pudieron cargar las categorías'),
    });

    if (!id) {
      this._autoCalcActive = true;
      return;
    }

    this.isLoading.set(true);
    this.form.get('stock')!.disable();
    this.api.getOne(id).subscribe({
      next: p => {
        this.form.patchValue({
          sku: p.sku, name: p.name,
          description: p.description ?? '',
          unit_price: p.unit_price,
          cost_price: p.cost_price,
          min_sale_price: p.min_sale_price,
          min_stock: p.min_stock,
          category_id: p.category_id,
        });
        this._autoCalcActive = true;
        this.isLoading.set(false);
      },
      error: () => { this.isLoading.set(false); this.router.navigate(['/productos']); },
    });
    this.resourcesApi.list(id).subscribe({
      next: res => this.existingResources.set(res),
      error: () => this.message.error('Error al cargar los recursos del producto'),
    });
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) this.handleFiles(Array.from(files));
  }

  onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) this.handleFiles(Array.from(input.files));
    input.value = '';
  }

  private handleFiles(files: File[]): void {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    for (const file of files) {
      if (!allowed.includes(file.type)) {
        this.message.warning(`${file.name}: solo JPEG, PNG, WebP o PDF`);
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        this.message.warning(`${file.name}: máximo 15 MB`);
        continue;
      }
      const resource_type: 'image' | 'pdf' = file.type === 'application/pdf' ? 'pdf' : 'image';
      const previewUrl = resource_type === 'image' ? URL.createObjectURL(file) : '';
      const queued: QueuedFile = { id: crypto.randomUUID(), file, previewUrl, resource_type, uploading: true, uploadedUrl: null, error: false };
      this.queuedFiles.update(q => [...q, queued]);

      if (this.isEdit() && this.productId()) {
        this.uploadAndAttach(queued);
      } else {
        this.uploadOnly(queued);
      }
    }
  }

  private uploadAndAttach(queued: QueuedFile): void {
    this.resourcesApi.uploadFile(queued.file).pipe(
      switchMap(result =>
        this.resourcesApi.add(this.productId()!, result.url, result.resource_type)
      )
    ).subscribe({
      next: resource => {
        if (queued.previewUrl) URL.revokeObjectURL(queued.previewUrl);
        this.existingResources.update(r => [...r, resource]);
        this.queuedFiles.update(q => q.filter(f => f !== queued));
      },
      error: () => {
        this.queuedFiles.update(q =>
          q.map(f => f === queued ? { ...f, uploading: false, error: true } : f)
        );
        this.message.error(`Error al subir ${queued.file.name}`);
      },
    });
  }

  private uploadOnly(queued: QueuedFile): void {
    this.resourcesApi.uploadFile(queued.file).subscribe({
      next: result => {
        this.queuedFiles.update(q =>
          q.map(f => f === queued
            ? { ...f, uploading: false, uploadedUrl: result.url }
            : f
          )
        );
      },
      error: () => {
        this.queuedFiles.update(q =>
          q.map(f => f === queued ? { ...f, uploading: false, error: true } : f)
        );
        this.message.error(`Error al subir ${queued.file.name}`);
      },
    });
  }

  removeQueued(queued: QueuedFile): void {
    if (queued.previewUrl) URL.revokeObjectURL(queued.previewUrl);
    this.queuedFiles.update(q => q.filter(f => f !== queued));
  }

  deleteExisting(resource: ProductResource): void {
    this.deletingId.set(resource.resource_id);
    this.resourcesApi.delete(this.productId()!, resource.resource_id).subscribe({
      next: () => {
        this.existingResources.update(r => r.filter(x => x.resource_id !== resource.resource_id));
        this.deletingId.set(null);
      },
      error: () => {
        this.message.error('Error al eliminar el recurso');
        this.deletingId.set(null);
      },
    });
  }

  setDefault(resource: ProductResource): void {
    this.resourcesApi.setDefault(this.productId()!, resource.resource_id).subscribe({
      next: updated => this.existingResources.set(updated),
      error: () => this.message.error('Error al actualizar'),
    });
  }

  submit(): void {
    const inFlight = this.queuedFiles().some(q => q.uploading);
    if (inFlight) {
      this.message.warning('Espera a que terminen de subir los archivos');
      return;
    }
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.submitting.set(true);

    const request$ = this.isEdit()
      ? this.api.update(this.productId()!, {
          sku: v.sku!, name: v.name!,
          description: v.description || undefined,
          unit_price: v.unit_price!, cost_price: v.cost_price ?? undefined,
          min_sale_price: v.min_sale_price ?? undefined, min_stock: v.min_stock ?? undefined,
          category_id: v.category_id ?? undefined,
        })
      : this.api.create({
          sku: v.sku!, name: v.name!,
          description: v.description || undefined,
          unit_price: v.unit_price!, cost_price: v.cost_price ?? undefined,
          min_sale_price: v.min_sale_price ?? undefined, stock: v.stock!,
          min_stock: v.min_stock ?? undefined, category_id: v.category_id ?? undefined,
        });

    request$.pipe(
      switchMap(product => {
        const ready = this.queuedFiles().filter(q => q.uploadedUrl && !q.error);
        if (ready.length === 0) return of(product);
        const attachments$ = ready.map(q =>
          this.resourcesApi.add(product.product_id, q.uploadedUrl!, q.resource_type)
        );
        return forkJoin(attachments$).pipe(switchMap(() => of(product)));
      })
    ).subscribe({
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

  onDragOver(event: DragEvent): void { event.preventDefault(); }
}
