import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Sale, SaleQuery } from '../../../shared/models/sale.model';
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
export class SalesApiService {
  private readonly http = inject(HttpClient);

  getSales(query: SaleQuery = {}): Observable<PaginatedResult<Sale>> {
    let params = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));

    if (query.from_date) params = params.set('from_date', query.from_date);
    if (query.to_date) params = params.set('to_date', query.to_date);
    if (query.payment_method) params = params.set('payment_method', query.payment_method);
    if (query.status) params = params.set('status', query.status);

    return this.http
      .get<ApiPaginatedResponse<Sale>>(`${environment.apiUrl}/sales`, { params })
      .pipe(map(res => res.data));
  }

  getSale(sale_id: string): Observable<Sale> {
    return this.http
      .get<ApiResponse<Sale>>(`${environment.apiUrl}/sales/${sale_id}`)
      .pipe(map(res => res.data));
  }

  voidSale(sale_id: string, void_reason: string): Observable<Sale> {
    return this.http
      .patch<ApiResponse<Sale>>(`${environment.apiUrl}/sales/${sale_id}/void`, { void_reason })
      .pipe(map(res => res.data));
  }
}
