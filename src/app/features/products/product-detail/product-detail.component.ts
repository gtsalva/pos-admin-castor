import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { ProductsApiService } from '../services/products-api.service';
import { ProductResourcesApiService } from '../services/product-resources-api.service';
import { Product } from '../../../shared/models/product.model';
import { ProductResource } from '../../../shared/models/product-resource.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink, CurrencyPipe, DatePipe,
    NzBreadCrumbModule, NzButtonModule, NzTagModule,
    NzSpinModule, NzDescriptionsModule, NzIconModule, NzPopconfirmModule,
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApiService);
  private readonly resourcesApi = inject(ProductResourcesApiService);
  private readonly msg = inject(NzMessageService);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(false);
  readonly resources = signal<ProductResource[]>([]);
  readonly deletingId = signal<string | null>(null);
  readonly selectedImageIdx = signal(0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/productos']); return; }
    this.isLoading.set(true);
    this.api.getOne(id).subscribe({
      next: p => { this.product.set(p); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.router.navigate(['/productos']); },
    });
    this.resourcesApi.list(id).subscribe({
      next: res => this.resources.set(res),
    });
  }

  get images(): ProductResource[] {
    return this.resources().filter(r => r.resource_type === 'image');
  }

  get pdfs(): ProductResource[] {
    return this.resources().filter(r => r.resource_type === 'pdf');
  }

  selectImage(idx: number): void { this.selectedImageIdx.set(idx); }

  setDefault(resource: ProductResource): void {
    const pid = this.product()!.product_id;
    this.resourcesApi.setDefault(pid, resource.resource_id).subscribe({
      next: updated => this.resources.set(updated),
      error: () => this.msg.error('Error al actualizar'),
    });
  }

  deleteResource(resource: ProductResource): void {
    this.deletingId.set(resource.resource_id);
    this.resourcesApi.delete(this.product()!.product_id, resource.resource_id).subscribe({
      next: () => {
        this.resources.update(r => r.filter(x => x.resource_id !== resource.resource_id));
        if (this.selectedImageIdx() >= this.images.length) this.selectedImageIdx.set(0);
        this.deletingId.set(null);
      },
      error: () => { this.msg.error('Error al eliminar'); this.deletingId.set(null); },
    });
  }

  stockColor(p: Product): string {
    if (p.stock < p.min_stock) return 'error';
    if (p.stock === p.min_stock) return 'warning';
    return 'success';
  }
}
