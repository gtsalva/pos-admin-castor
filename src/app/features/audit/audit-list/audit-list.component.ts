import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NzMessageService } from 'ng-zorro-antd/message';
import { AuditApiService, AuditFilters } from '../services/audit-api.service';
import { AuditLog, PaginatedAuditLogs } from '../models/audit-log.model';

const ACTION_COLORS: Record<string, string> = {
  LOGIN: 'blue',
  SALE_CREATED: 'green',
  SALE_VOIDED: 'red',
  INVENTORY_ADJUSTED: 'orange',
  SHIFT_CLOSED: 'purple',
  SHIFT_REOPENED: 'gold',
  RECONCILIATION_CREATED: 'cyan',
  USER_CREATED: 'geekblue',
  USER_UPDATED: 'lime',
  USER_STATUS_CHANGED: 'volcano',
};

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [
    NzTableModule, NzSelectModule, NzDatePickerModule, NzTagModule,
    NzButtonModule, NzGridModule, ReactiveFormsModule, DatePipe,
  ],
  templateUrl: './audit-list.component.html',
})
export class AuditListComponent implements OnInit {
  private readonly auditApi = inject(AuditApiService);
  private readonly fb = inject(FormBuilder);
  private readonly msg = inject(NzMessageService);

  readonly result = signal<PaginatedAuditLogs | null>(null);
  readonly loading = signal(true);
  readonly currentPage = signal(1);

  readonly filters: FormGroup = this.fb.group({
    action: [''],
    date_range: [null],
  });

  readonly actions = Object.keys(ACTION_COLORS);
  readonly actionColors: Record<string, string | undefined> = ACTION_COLORS;

  ngOnInit(): void { this.load(); }

  load(page = 1): void {
    this.currentPage.set(page);
    this.loading.set(true);
    const filters: AuditFilters = { page, limit: 50 };
    const action = this.filters.get('action')!.value as string;
    const dateRange = this.filters.get('date_range')!.value as [Date, Date] | null;
    if (action) filters.action = action;
    if (dateRange) {
      filters.date_from = dateRange[0].toISOString().slice(0, 10);
      filters.date_to = dateRange[1].toISOString().slice(0, 10);
    }
    this.auditApi.getAll(filters).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); this.msg.error('No se pudo cargar el historial de auditoría.'); },
    });
  }

  reset(): void { this.filters.reset({ action: '', date_range: null }); this.load(); }

  metaStr(log: AuditLog): string {
    return log.metadata ? JSON.stringify(log.metadata) : '—';
  }
}
