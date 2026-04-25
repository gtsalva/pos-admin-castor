import { Injectable, inject, signal } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { TableParams } from '../../../shared/models/pagination.model';
import { ProductsApiService } from './products-api.service';

@Injectable()
export class ProductsStateService {
  private readonly api = inject(ProductsApiService);

  private readonly _items = signal<Product[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _params = signal<TableParams>({ page: 1, limit: 20 });

  readonly items = this._items.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly params = this._params.asReadonly();

  load(): void {
    this._isLoading.set(true);
    this.api.searchProducts(this._params()).subscribe({
      next: res => {
        this._items.set(res.data);
        this._total.set(res.total);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false),
    });
  }

  setPage(page: number): void {
    this._params.update(p => ({ ...p, page }));
    this.load();
  }

  setPageSize(limit: number): void {
    this._params.update(p => ({ ...p, limit, page: 1 }));
    this.load();
  }

  search(query: string): void {
    this._params.update(p => ({ ...p, query: query || undefined, page: 1 }));
    this.load();
  }
}
