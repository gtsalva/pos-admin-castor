import { Component, OnInit, inject, signal } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
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
    NzButtonModule, NzGridModule, FormsModule, DatePipe,
  ],
  templateUrl: './audit-list.component.html',
})
export class AuditListComponent implements OnInit {
  private readonly auditApi = inject(AuditApiService);

  readonly result = signal<PaginatedAuditLogs | null>(null);
  readonly loading = signal(true);

  filterAction = '';
  filterDateRange: [Date, Date] | null = null;

  readonly actions = Object.keys(ACTION_COLORS);
  readonly actionColors = ACTION_COLORS;

  ngOnInit(): void { this.load(); }

  load(page = 1): void {
    this.loading.set(true);
    const filters: AuditFilters = { page, limit: 50 };
    if (this.filterAction) filters.action = this.filterAction;
    if (this.filterDateRange) {
      filters.date_from = this.filterDateRange[0].toISOString().slice(0, 10);
      filters.date_to = this.filterDateRange[1].toISOString().slice(0, 10);
    }
    this.auditApi.getAll(filters).subscribe({
      next: (r) => { this.result.set(r); this.loading.set(false); },
      error: () => { this.loading.set(false); },
    });
  }

  reset(): void { this.filterAction = ''; this.filterDateRange = null; this.load(); }

  metaStr(log: AuditLog): string {
    return log.metadata ? JSON.stringify(log.metadata) : '—';
  }
}
