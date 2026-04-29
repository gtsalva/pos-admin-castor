import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  TopSellerRow,
  TopProductRow,
  ProductMarginRow,
  RevenueReport,
  TopSellersFilters,
  TopProductsFilters,
  ProductMarginsFilters,
  RevenueFilters,
} from '../models/report.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ReportsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/reports`;

  private buildParams(filters: Record<string, string | number | undefined>): HttpParams {
    let params = new HttpParams();
    for (const [key, val] of Object.entries(filters)) {
      if (val !== undefined && val !== null && val !== '') {
        params = params.set(key, String(val));
      }
    }
    return params;
  }

  getTopSellers(filters: TopSellersFilters = {}): Observable<TopSellerRow[]> {
    return this.http.get<ApiResponse<TopSellerRow[]>>(`${this.base}/top-sellers`, {
      params: this.buildParams(filters as Record<string, string | number | undefined>),
    }).pipe(map(res => res.data));
  }

  getTopProducts(filters: TopProductsFilters = {}): Observable<TopProductRow[]> {
    return this.http.get<ApiResponse<TopProductRow[]>>(`${this.base}/top-products`, {
      params: this.buildParams(filters as Record<string, string | number | undefined>),
    }).pipe(map(res => res.data));
  }

  getProductMargins(filters: ProductMarginsFilters = {}): Observable<ProductMarginRow[]> {
    return this.http.get<ApiResponse<ProductMarginRow[]>>(`${this.base}/product-margins`, {
      params: this.buildParams(filters as Record<string, string | number | undefined>),
    }).pipe(map(res => res.data));
  }

  getRevenue(filters: RevenueFilters = {}): Observable<RevenueReport> {
    return this.http.get<ApiResponse<RevenueReport>>(`${this.base}/revenue`, {
      params: this.buildParams(filters as Record<string, string | number | undefined>),
    }).pipe(map(res => res.data));
  }
}
