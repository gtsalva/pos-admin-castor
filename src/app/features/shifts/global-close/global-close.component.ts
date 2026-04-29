import { Component, OnInit, inject, signal, output } from '@angular/core';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { ShiftsApiService } from '../services/shifts-api.service';
import { DailySummaryEntry, DailySummary } from '../models/shift.model';

@Component({
  selector: 'app-global-close',
  standalone: true,
  imports: [
    NzTableModule, NzButtonModule, NzTagModule, NzDatePickerModule,
    NzPopconfirmModule, NzSpinModule, FormsModule, DecimalPipe,
  ],
  templateUrl: './global-close.component.html',
})
export class GlobalCloseComponent implements OnInit {
  private readonly shiftsApi = inject(ShiftsApiService);
  private readonly msg = inject(NzMessageService);

  readonly reconcileRequested = output<DailySummaryEntry>();

  readonly loading = signal(true);
  readonly summary = signal<DailySummary | null>(null);
  readonly actionLoading = signal<string | null>(null);
  selectedDate: Date = new Date();

  ngOnInit(): void { this.loadSummary(); }

  loadSummary(): void {
    this.loading.set(true);
    const date = this.formatDate(this.selectedDate);
    this.shiftsApi.getDailySummary(date).subscribe({
      next: (s) => { this.summary.set(s); this.loading.set(false); },
      error: () => { this.loading.set(false); this.msg.error('No se pudo cargar el resumen del día.'); },
    });
  }

  private formatDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  closeShift(entry: DailySummaryEntry): void {
    this.actionLoading.set(entry.salesperson_id);
    this.shiftsApi.closeShift(entry.salesperson_id).subscribe({
      next: () => { this.msg.success('Turno cerrado'); this.actionLoading.set(null); this.loadSummary(); },
      error: (err: { error?: { message?: string } }) => { this.msg.error(err?.error?.message ?? 'Error'); this.actionLoading.set(null); },
    });
  }

  reopenShift(entry: DailySummaryEntry): void {
    if (!entry.shift_close) return;
    this.actionLoading.set(entry.salesperson_id);
    this.shiftsApi.reopenShift(entry.shift_close.shift_close_id).subscribe({
      next: () => { this.msg.success('Turno reabierto'); this.actionLoading.set(null); this.loadSummary(); },
      error: (err: { error?: { message?: string } }) => { this.msg.error(err?.error?.message ?? 'Error'); this.actionLoading.set(null); },
    });
  }

  requestReconcile(entry: DailySummaryEntry): void {
    this.reconcileRequested.emit(entry);
  }
}
