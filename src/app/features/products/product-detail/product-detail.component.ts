import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { ProductsApiService } from '../services/products-api.service';
import { Product } from '../../../shared/models/product.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    NzBreadCrumbModule,
    NzButtonModule,
    NzTagModule,
    NzSpinModule,
    NzDescriptionsModule,
  ],
  templateUrl: './product-detail.component.html',
})
export class ProductDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApiService);

  readonly product = signal<Product | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/productos']); return; }
    this.isLoading.set(true);
    this.api.getOne(id).subscribe({
      next: p => { this.product.set(p); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.router.navigate(['/productos']); },
    });
  }

  stockColor(p: Product): string {
    if (p.stock < p.min_stock) return 'error';
    if (p.stock === p.min_stock) return 'warning';
    return 'success';
  }
}
