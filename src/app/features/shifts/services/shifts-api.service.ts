import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { DailySummary, ShiftClose, Reconciliation } from '../models/shift.model';

interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

@Injectable({ providedIn: 'root' })
export class ShiftsApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiUrl}/shifts`;

  getDailySummary(date?: string): Observable<DailySummary> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http
      .get<ApiResponse<DailySummary>>(`${this.base}/daily-summary`, { params })
      .pipe(map((r) => r.data));
  }

  closeShift(salesperson_id: string, notes?: string): Observable<ShiftClose> {
    return this.http
      .post<ApiResponse<ShiftClose>>(`${this.base}/close`, { salesperson_id, notes })
      .pipe(map((r) => r.data));
  }

  reopenShift(shift_close_id: string, notes?: string): Observable<ShiftClose> {
    return this.http
      .post<ApiResponse<ShiftClose>>(`${this.base}/${shift_close_id}/reopen`, { notes })
      .pipe(map((r) => r.data));
  }

  createReconciliation(
    shift_close_id: string,
    body: {
      cash_counted: number;
      card_counted: number;
      transfer_counted: number;
      other_counted: number;
      notes?: string;
    },
  ): Observable<Reconciliation> {
    return this.http
      .post<ApiResponse<Reconciliation>>(`${this.base}/${shift_close_id}/reconciliation`, body)
      .pipe(map((r) => r.data));
  }
}
