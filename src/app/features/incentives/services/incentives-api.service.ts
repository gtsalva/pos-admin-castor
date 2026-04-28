import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import {
  IncentivePeriod, PeriodPerformance,
  CreatePeriodPayload, UpdatePeriodPayload,
} from '../models/incentive.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class IncentivesApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/incentives`;

  getPeriods(is_active?: boolean): Observable<IncentivePeriod[]> {
    let params = new HttpParams();
    if (is_active !== undefined) params = params.set('is_active', String(is_active));
    return this.http
      .get<ApiResponse<IncentivePeriod[]>>(`${this.base}/periods`, { params })
      .pipe(map(r => r.data));
  }

  getPeriod(period_id: string): Observable<IncentivePeriod> {
    return this.http
      .get<ApiResponse<IncentivePeriod>>(`${this.base}/periods/${period_id}`)
      .pipe(map(r => r.data));
  }

  createPeriod(payload: CreatePeriodPayload): Observable<IncentivePeriod> {
    return this.http
      .post<ApiResponse<IncentivePeriod>>(`${this.base}/periods`, payload)
      .pipe(map(r => r.data));
  }

  updatePeriod(period_id: string, payload: UpdatePeriodPayload): Observable<IncentivePeriod> {
    return this.http
      .patch<ApiResponse<IncentivePeriod>>(`${this.base}/periods/${period_id}`, payload)
      .pipe(map(r => r.data));
  }

  getPeriodPerformance(period_id: string): Observable<PeriodPerformance> {
    return this.http
      .get<ApiResponse<PeriodPerformance>>(`${this.base}/periods/${period_id}/performance`)
      .pipe(map(r => r.data));
  }

  liquidate(period_id: string, salesperson_id: string): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.base}/periods/${period_id}/liquidate/${salesperson_id}`, {})
      .pipe(map(() => undefined));
  }
}
