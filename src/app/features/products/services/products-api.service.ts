import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Product } from '../../../shared/models/product.model';
import { PaginatedResult, TableParams } from '../../../shared/models/pagination.model';

interface ApiListResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);

  searchProducts(params: TableParams): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('limit', String(params.limit));

    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);

    return this.http
      .get<ApiListResponse<Product>>(`${environment.apiUrl}/products`, { params: httpParams })
      .pipe(
        map(res => ({ data: res.data, total: res.total, page: res.page, limit: res.limit }))
      );
  }
}
