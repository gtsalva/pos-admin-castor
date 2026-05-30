import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { InventoryItem, InventoryMovement, AdjustStockPayload, InventorySummary } from '../../../shared/models/inventory.model';
import { PaginatedResult } from '../../../shared/models/pagination.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

interface ApiPaginatedResponse<T> {
  data: PaginatedResult<T>;
  message: string;
  statusCode: number;
}

export interface InventoryQuery {
  page?: number;
  limit?: number;
  low_stock?: boolean;
  search?: string;
  category_id?: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryApiService {
  private readonly http = inject(HttpClient);

  getInventory(query: InventoryQuery = {}): Observable<PaginatedResult<InventoryItem>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));

    if (query.low_stock)    params = params.set('low_stock',    'true');
    if (query.search)       params = params.set('search',       query.search);
    if (query.category_id)  params = params.set('category_id',  query.category_id);

    return this.http
      .get<ApiPaginatedResponse<InventoryItem>>(`${environment.apiUrl}/inventory`, { params })
      .pipe(map(res => res.data));
  }

  getMovements(product_id: string, page = 1, limit = 20): Observable<PaginatedResult<InventoryMovement>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('limit', String(limit));

    return this.http
      .get<ApiPaginatedResponse<InventoryMovement>>(
        `${environment.apiUrl}/inventory/${product_id}/movements`,
        { params }
      )
      .pipe(map(res => res.data));
  }

  getSummary(): Observable<InventorySummary> {
    return this.http
      .get<ApiResponse<InventorySummary>>(`${environment.apiUrl}/inventory/summary`)
      .pipe(map(res => res.data));
  }

  adjustStock(payload: AdjustStockPayload): Observable<InventoryMovement> {
    return this.http
      .post<ApiResponse<InventoryMovement>>(`${environment.apiUrl}/inventory/adjust`, payload)
      .pipe(map(res => res.data));
  }
}
