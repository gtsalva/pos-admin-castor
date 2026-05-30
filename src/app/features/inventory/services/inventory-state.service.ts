import { Injectable, inject, signal } from '@angular/core';
import { InventoryItem, InventorySummary } from '../../../shared/models/inventory.model';
import { InventoryApiService, InventoryQuery } from './inventory-api.service';

@Injectable()
export class InventoryStateService {
  private readonly api = inject(InventoryApiService);

  private readonly _items = signal<InventoryItem[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _query = signal<InventoryQuery>({ page: 1, limit: 20 });
  private readonly _summary = signal<InventorySummary | null>(null);

  readonly items = this._items.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly query = this._query.asReadonly();
  readonly summary = this._summary.asReadonly();

  load(): void {
    this._isLoading.set(true);
    this.api.getInventory(this._query()).subscribe({
      next: res => {
        this._items.set(res.data);
        this._total.set(res.total);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false),
    });
  }

  loadSummary(): void {
    this.api.getSummary().subscribe({
      next: s => this._summary.set(s),
      error: () => {},
    });
  }

  setPage(page: number): void {
    this._query.update(q => ({ ...q, page }));
    this.load();
  }

  toggleLowStock(low_stock: boolean): void {
    this._query.update(q => ({ ...q, low_stock: low_stock || undefined, page: 1 }));
    this.load();
  }

  setSearch(search: string): void {
    this._query.update(q => ({ ...q, search: search.trim() || undefined, page: 1 }));
    this.load();
  }

  setCategoryFilter(category_id: string | null): void {
    this._query.update(q => ({ ...q, category_id: category_id ?? undefined, page: 1 }));
    this.load();
  }
}
