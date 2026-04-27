import { Injectable, inject, signal } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Sale, SaleQuery } from '../../../shared/models/sale.model';
import { SalesApiService } from './sales-api.service';

@Injectable()
export class SalesStateService {
  private readonly api = inject(SalesApiService);
  private readonly message = inject(NzMessageService);

  private readonly _sales = signal<Sale[]>([]);
  private readonly _total = signal(0);
  private readonly _isLoading = signal(false);
  private readonly _query = signal<SaleQuery>({ page: 1, limit: 20 });

  readonly sales = this._sales.asReadonly();
  readonly total = this._total.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly query = this._query.asReadonly();

  load(): void {
    this._isLoading.set(true);
    this.api.getSales(this._query()).subscribe({
      next: res => {
        this._sales.set(res.data);
        this._total.set(res.total);
        this._isLoading.set(false);
      },
      error: () => this._isLoading.set(false),
    });
  }

  setPage(page: number): void {
    this._query.update(q => ({ ...q, page }));
    this.load();
  }

  setFilters(filters: Partial<SaleQuery>): void {
    this._query.update(q => ({ ...q, ...filters, page: 1 }));
    this.load();
  }
}
