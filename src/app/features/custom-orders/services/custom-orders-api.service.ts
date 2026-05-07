import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedResult } from '../../../shared/models/pagination.model';
import {
  CustomOrder,
  CustomOrderQuery,
  CreateCustomOrderPayload,
  RegisterPaymentPayload,
} from '../models/custom-order.model';

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
export class CustomOrdersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/custom-orders`;

  getAll(query: CustomOrderQuery = {}): Observable<PaginatedResult<CustomOrder>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));

    if (query.status) params = params.set('status', query.status);
    if (query.salesperson_id) params = params.set('salesperson_id', query.salesperson_id);
    if (query.from_date) params = params.set('from_date', query.from_date);
    if (query.to_date) params = params.set('to_date', query.to_date);

    return this.http
      .get<ApiPaginatedResponse<CustomOrder>>(this.base, { params })
      .pipe(map(res => res.data));
  }

  getOne(id: string): Observable<CustomOrder> {
    return this.http
      .get<ApiResponse<CustomOrder>>(`${this.base}/${id}`)
      .pipe(map(res => res.data));
  }

  create(payload: CreateCustomOrderPayload): Observable<CustomOrder> {
    return this.http
      .post<ApiResponse<CustomOrder>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(id: string, payload: Partial<CreateCustomOrderPayload>): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}`, payload)
      .pipe(map(res => res.data));
  }

  send(id: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/send`, {})
      .pipe(map(res => res.data));
  }

  approve(id: string, delivery_date: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/approve`, { delivery_date })
      .pipe(map(res => res.data));
  }

  markProduction(id: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/production`, {})
      .pipe(map(res => res.data));
  }

  markDelivered(id: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/deliver`, {})
      .pipe(map(res => res.data));
  }

  cancel(id: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/cancel`, {})
      .pipe(map(res => res.data));
  }

  updateDeliveryDate(id: string, delivery_date: string): Observable<CustomOrder> {
    return this.http
      .patch<ApiResponse<CustomOrder>>(`${this.base}/${id}/delivery-date`, {
        delivery_date,
      })
      .pipe(map(res => res.data));
  }

  registerPayment(id: string, payload: RegisterPaymentPayload): Observable<CustomOrder> {
    return this.http
      .post<ApiResponse<CustomOrder>>(`${this.base}/${id}/payments`, payload)
      .pipe(map(res => res.data));
  }
}
