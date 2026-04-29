import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PaginatedAuditLogs } from '../models/audit-log.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export interface AuditFilters {
  action?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

@Injectable({ providedIn: 'root' })
export class AuditApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/audit`;

  getAll(filters: AuditFilters = {}): Observable<PaginatedAuditLogs> {
    let params = new HttpParams();
    if (filters.action) params = params.set('action', filters.action);
    if (filters.date_from) params = params.set('date_from', filters.date_from);
    if (filters.date_to) params = params.set('date_to', filters.date_to);
    if (filters.page) params = params.set('page', String(filters.page));
    if (filters.limit) params = params.set('limit', String(filters.limit));
    return this.http
      .get<ApiResponse<PaginatedAuditLogs>>(`${this.base}`, { params })
      .pipe(map((r) => r.data));
  }
}
