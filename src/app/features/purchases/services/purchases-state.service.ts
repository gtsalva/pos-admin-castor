import { Injectable, inject, signal } from '@angular/core';
import { PurchasesApiService } from './purchases-api.service';
import { PurchaseOrder, PurchaseQuery, PurchaseStatus } from '../models/purchase.model';

@Injectable()
export class PurchasesStateService {
  private readonly api = inject(PurchasesApiService);

  private readonly _items = signal<PurchaseOrder[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _query = signal<PurchaseQuery>({ page: 1, limit: 20 });

  readonly items = this._items.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly query = this._query.asReadonly();

  load(): void {
    this._isLoading.set(true);
    this.api.getAll(this._query()).subscribe({
      next: (res) => {
        this._items.set(res.data);
        this._total.set(res.total);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false),
    });
  }

  setPage(page: number): void {
    this._query.update((q) => ({ ...q, page }));
    this.load();
  }

  filterByStatus(status: PurchaseStatus | undefined): void {
    this._query.update((q) => ({ ...q, status, page: 1 }));
    this.load();
  }
}
