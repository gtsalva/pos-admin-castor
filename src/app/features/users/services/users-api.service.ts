import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { User, CreateUserPayload, UpdateUserPayload } from '../models/user.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class UsersApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/users`;

  getAll(): Observable<User[]> {
    return this.http
      .get<ApiResponse<User[]>>(this.base)
      .pipe(map((res) => res.data));
  }

  getById(user_id: string): Observable<User> {
    return this.http
      .get<ApiResponse<User>>(`${this.base}/${user_id}`)
      .pipe(map((res) => res.data));
  }

  create(payload: CreateUserPayload): Observable<User> {
    return this.http
      .post<ApiResponse<User>>(this.base, payload)
      .pipe(map((res) => res.data));
  }

  update(user_id: string, payload: UpdateUserPayload): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.base}/${user_id}`, payload)
      .pipe(map((res) => res.data));
  }

  uploadPhoto(user_id: string, file: File): Observable<User> {
    const fd = new FormData();
    fd.append('file', file);
    return this.http
      .patch<ApiResponse<User>>(`${this.base}/${user_id}/photo`, fd)
      .pipe(map((res) => res.data));
  }

  removePhoto(user_id: string): Observable<User> {
    return this.http
      .delete<ApiResponse<User>>(`${this.base}/${user_id}/photo`)
      .pipe(map((res) => res.data));
  }

  toggleStatus(user_id: string): Observable<User> {
    return this.http
      .patch<ApiResponse<User>>(`${this.base}/${user_id}/status`, {})
      .pipe(map((res) => res.data));
  }

  resetPassword(user_id: string, new_password: string): Observable<void> {
    return this.http
      .patch<void>(`${this.base}/${user_id}/password`, { new_password });
  }
}
