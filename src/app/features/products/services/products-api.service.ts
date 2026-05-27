import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Product, CreateProductDto, UpdateProductDto } from '../../../shared/models/product.model';
import { PaginatedResult, TableParams } from '../../../shared/models/pagination.model';

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

export interface ProductSearchQuery {
  search?: string;
  limit?: number;
  page?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/products`;

  searchProducts(params: TableParams): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('limit', String(params.limit));

    if (params.query) httpParams = httpParams.set('query', params.query);
    if (params.category_id) httpParams = httpParams.set('category_id', params.category_id);

    return this.http
      .get<ApiPaginatedResponse<Product>>(this.base, { params: httpParams })
      .pipe(map(res => res.data));
  }

  getAll(query: ProductSearchQuery = {}): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(query.page ?? 1))
      .set('limit', String(query.limit ?? 20));

    if (query.search) httpParams = httpParams.set('query', query.search);

    return this.http
      .get<ApiPaginatedResponse<Product>>(this.base, { params: httpParams })
      .pipe(map(res => res.data));
  }

  getOne(product_id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.base}/${product_id}`)
      .pipe(map(res => res.data));
  }

  create(payload: CreateProductDto): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(product_id: string, payload: UpdateProductDto): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(`${this.base}/${product_id}`, payload)
      .pipe(map(res => res.data));
  }

  delete(product_id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${product_id}`);
  }

  checkSku(sku: string, exclude_id?: string): Observable<{ available: boolean; used_by_deleted: boolean }> {
    let params = new HttpParams().set('sku', sku);
    if (exclude_id) params = params.set('exclude_id', exclude_id);
    return this.http
      .get<ApiResponse<{ available: boolean; used_by_deleted: boolean }>>(
        `${this.base}/check-sku`,
        { params },
      )
      .pipe(map(res => res.data));
  }

  getDeleted(params: TableParams): Observable<PaginatedResult<Product>> {
    let httpParams = new HttpParams()
      .set('page', String(params.page))
      .set('limit', String(params.limit));
    if (params.query) httpParams = httpParams.set('query', params.query);
    return this.http
      .get<ApiPaginatedResponse<Product>>(`${this.base}/deleted`, { params: httpParams })
      .pipe(map(res => res.data));
  }

  restore(product_id: string): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(`${this.base}/${product_id}/restore`, {})
      .pipe(map(res => res.data));
  }

  permanentDelete(product_id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${product_id}/permanent`);
  }
}
