import { Component, input, output, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzInputModule } from 'ng-zorro-antd/input';
import { DecimalPipe } from '@angular/common';
import { ShiftsApiService } from '../services/shifts-api.service';
import { DailySummaryEntry } from '../models/shift.model';

@Component({
  selector: 'app-reconciliation',
  standalone: true,
  imports: [
    ReactiveFormsModule, NzFormModule, NzInputNumberModule, NzButtonModule,
    NzDividerModule, NzGridModule, NzInputModule, DecimalPipe,
  ],
  templateUrl: './reconciliation.component.html',
})
export class ReconciliationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly shiftsApi = inject(ShiftsApiService);
  private readonly msg = inject(NzMessageService);

  readonly entry = input.required<DailySummaryEntry>();
  readonly done = output<void>();
  readonly saving = signal(false);

  readonly form: FormGroup = this.fb.group({
    cash_counted: [null, [Validators.required, Validators.min(0)]],
    card_counted: [null, [Validators.required, Validators.min(0)]],
    transfer_counted: [null, [Validators.required, Validators.min(0)]],
    other_counted: [0, [Validators.required, Validators.min(0)]],
    notes: [null],
  });

  diff(field: 'cash' | 'card' | 'transfer'): number {
    const counted = this.form.get(`${field}_counted`)?.value ?? 0;
    const expected = this.entry()[`${field}_total` as keyof DailySummaryEntry] as number;
    return (counted ?? 0) - expected;
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    if (!this.entry().shift_close) return;

    this.saving.set(true);
    this.shiftsApi.createReconciliation(this.entry().shift_close!.shift_close_id, this.form.value).subscribe({
      next: () => { this.msg.success('Conciliación guardada'); this.saving.set(false); this.done.emit(); },
      error: (err: { error?: { message?: string } }) => { this.msg.error(err?.error?.message ?? 'Error'); this.saving.set(false); },
    });
  }
}
