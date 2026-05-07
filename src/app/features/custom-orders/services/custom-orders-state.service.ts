import { Injectable, inject, signal } from '@angular/core';
import { CustomOrder, CustomOrderQuery } from '../models/custom-order.model';
import { CustomOrdersApiService } from './custom-orders-api.service';
import { PaginatedResult } from '../../../shared/models/pagination.model';

@Injectable()
export class CustomOrdersStateService {
  private readonly api = inject(CustomOrdersApiService);

  private readonly _items = signal<CustomOrder[]>([]);
  private readonly _total = signal(0);
  private readonly _page = signal(1);
  private readonly _limit = signal(20);
  private readonly _loading = signal(false);
  private readonly _filters = signal<CustomOrderQuery>({});

  readonly items = this._items.asReadonly();
  readonly total = this._total.asReadonly();
  readonly page = this._page.asReadonly();
  readonly limit = this._limit.asReadonly();
  readonly loading = this._loading.asReadonly();

  load(query: CustomOrderQuery = {}): void {
    this._loading.set(true);
    this._filters.set(query);
    this.api
      .getAll({ ...query, page: this._page(), limit: this._limit() })
      .subscribe({
        next: (result: PaginatedResult<CustomOrder>) => {
          this._items.set(result.data);
          this._total.set(result.total);
          this._loading.set(false);
        },
        error: () => this._loading.set(false),
      });
  }

  setPage(page: number): void {
    this._page.set(page);
    this.load(this._filters());
  }

  setPageSize(limit: number): void {
    this._limit.set(limit);
    this._page.set(1);
    this.load(this._filters());
  }

  setFilters(filters: CustomOrderQuery): void {
    this._filters.set(filters);
    this._page.set(1);
    this.load(filters);
  }
}
