import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface Category {
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http
      .get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`)
      .pipe(map(res => res.data));
  }
}
