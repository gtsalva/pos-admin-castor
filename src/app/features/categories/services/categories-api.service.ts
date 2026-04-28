import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Category, CreateCategoryPayload, UpdateCategoryPayload } from '../models/category.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriesAdminApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/categories`;

  getAll(includeInactive = false): Observable<Category[]> {
    const params = includeInactive
      ? new HttpParams().set('include_inactive', 'true')
      : new HttpParams();
    return this.http
      .get<ApiResponse<Category[]>>(this.base, { params })
      .pipe(map(res => res.data));
  }

  create(payload: CreateCategoryPayload): Observable<Category> {
    return this.http
      .post<ApiResponse<Category>>(this.base, payload)
      .pipe(map(res => res.data));
  }

  update(category_id: string, payload: UpdateCategoryPayload): Observable<Category> {
    return this.http
      .patch<ApiResponse<Category>>(`${this.base}/${category_id}`, payload)
      .pipe(map(res => res.data));
  }
}
