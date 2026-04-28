import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  Supplier,
  CreateSupplierPayload,
  UpdateSupplierPayload,
  SupplierQuery,
} from '../models/supplier.model';
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

@Injectable({ providedIn: 'root' })
export class SuppliersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/suppliers`;

  getAll(query: SupplierQuery = {}): Observable<PaginatedResult<Supplier>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));
    if (query.search) params = params.set('search', query.search);
    if (query.is_active !== undefined) params = params.set('is_active', String(query.is_active));

    return this.http
      .get<ApiPaginatedResponse<Supplier>>(this.base, { params })
      .pipe(map((res) => res.data));
  }

  getOne(supplier_id: string): Observable<Supplier> {
    return this.http
      .get<ApiResponse<Supplier>>(`${this.base}/${supplier_id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateSupplierPayload): Observable<Supplier> {
    return this.http
      .post<ApiResponse<Supplier>>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  update(supplier_id: string, payload: UpdateSupplierPayload): Observable<Supplier> {
    return this.http
      .patch<ApiResponse<Supplier>>(`${this.base}/${supplier_id}`, payload)
      .pipe(map((res) => res.data));
  }
}
