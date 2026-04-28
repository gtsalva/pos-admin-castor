import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { ProductResource } from '../../../shared/models/product-resource.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface UploadResult {
  url: string;
  resource_type: 'image' | 'pdf';
}

@Injectable({ providedIn: 'root' })
export class ProductResourcesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}`;

  uploadFile(file: File): Observable<UploadResult> {
    const form = new FormData();
    form.append('file', file);
    return this.http
      .post<ApiResponse<UploadResult>>(`${this.base}/storage/products/upload`, form)
      .pipe(map(res => res.data));
  }

  list(product_id: string): Observable<ProductResource[]> {
    return this.http
      .get<ApiResponse<ProductResource[]>>(`${this.base}/products/${product_id}/resources`)
      .pipe(map(res => res.data));
  }

  add(product_id: string, url: string, resource_type: 'image' | 'pdf'): Observable<ProductResource> {
    return this.http
      .post<ApiResponse<ProductResource>>(`${this.base}/products/${product_id}/resources`, {
        url,
        resource_type,
      })
      .pipe(map(res => res.data));
  }

  delete(product_id: string, resource_id: string): Observable<void> {
    return this.http
      .delete<void>(`${this.base}/products/${product_id}/resources/${resource_id}`);
  }

  setDefault(product_id: string, resource_id: string): Observable<ProductResource[]> {
    return this.http
      .patch<ApiResponse<ProductResource[]>>(
        `${this.base}/products/${product_id}/resources/${resource_id}/set-default`,
        {},
      )
      .pipe(map(res => res.data));
  }
}
