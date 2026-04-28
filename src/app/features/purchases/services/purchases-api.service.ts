import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  PurchaseOrder,
  CreatePurchasePayload,
  ReceivePurchasePayload,
  PurchaseQuery,
} from '../models/purchase.model';
import { PaginatedResult } from '../../../../shared/models/pagination.model';

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

@Injectable({ providedIn: 'root' })
export class PurchasesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/purchases`;

  getAll(query: PurchaseQuery = {}): Observable<PaginatedResult<PurchaseOrder>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));
    if (query.status) params = params.set('status', query.status);
    if (query.supplier_id) params = params.set('supplier_id', query.supplier_id);

    return this.http
      .get<ApiPaginatedResponse<PurchaseOrder>>(this.base, { params })
      .pipe(map((res) => res.data));
  }

  getOne(id: string): Observable<PurchaseOrder> {
    return this.http
      .get<ApiResponse<PurchaseOrder>>(`${this.base}/${id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreatePurchasePayload): Observable<PurchaseOrder> {
    return this.http
      .post<ApiResponse<PurchaseOrder>>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  receive(id: string, payload: ReceivePurchasePayload): Observable<PurchaseOrder> {
    return this.http
      .patch<ApiResponse<PurchaseOrder>>(`${this.base}/${id}/receive`, payload)
      .pipe(map((res) => res.data));
  }

  cancel(id: string, cancellation_reason: string): Observable<PurchaseOrder> {
    return this.http
      .patch<ApiResponse<PurchaseOrder>>(`${this.base}/${id}/cancel`, { cancellation_reason })
      .pipe(map((res) => res.data));
  }
}
