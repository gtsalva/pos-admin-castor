import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CleanupDeleted {
  inventory_movements: number;
  sale_payments: number;
  sale_items: number;
  sales: number;
  purchase_order_items: number;
  purchase_orders: number;
  custom_order_print_receipts: number;
  custom_order_commission_payments: number;
  custom_order_payments: number;
  custom_order_items: number;
  custom_orders: number;
  reconciliations: number;
  shift_closes: number;
  incentive_liquidations: number;
  incentive_periods: number;
  clients: number;
  suppliers: number;
  product_resources: number;
  products: number;
  categories: number;
}

export interface CleanupReport {
  dry_run: boolean;
  deleted: CleanupDeleted;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class AdminToolsApiService {
  private readonly http = inject(HttpClient);

  cleanupSeed(dry_run: boolean): Observable<CleanupReport> {
    return this.http
      .post<ApiResponse<CleanupReport>>(
        `${environment.apiUrl}/admin-tools/cleanup-seed`,
        { dry_run },
      )
      .pipe(map(res => res.data));
  }
}
