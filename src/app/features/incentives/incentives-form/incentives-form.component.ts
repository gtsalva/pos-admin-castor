import { Component, input, output, OnChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { IncentivePeriod, CreatePeriodPayload } from '../models/incentive.model';

@Component({
  selector: 'app-incentives-form',
  standalone: true,
  imports: [
    ReactiveFormsModule, NzModalModule, NzFormModule,
    NzInputModule, NzInputNumberModule, NzDatePickerModule,
    NzCheckboxModule, NzButtonModule,
  ],
  templateUrl: './incentives-form.component.html',
})
export class IncentivesFormComponent implements OnChanges {
  readonly visible = input(false);
  readonly period = input<IncentivePeriod | null>(null);
  readonly save = output<CreatePeriodPayload>();
  readonly cancel = output<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    start_date: ['', Validators.required],
    end_date: ['', Validators.required],
    goal_amount: [0, [Validators.required, Validators.min(0)]],
    commission_rate: [5, [Validators.required, Validators.min(0), Validators.max(100)]],
    is_active: [true],
  });

  readonly formatQ = (v: number) => `Q ${v}`;
  readonly formatPct = (v: number) => `${v}%`;

  get isEdit(): boolean { return !!this.period(); }

  private toDateString(value: string | Date | null | undefined): string {
    if (!value) return '';
    if (typeof value === 'string') return value;
    return value.toISOString().split('T')[0];
  }

  ngOnChanges(): void {
    const p = this.period();
    if (p) {
      this.form.patchValue({
        name: p.name,
        start_date: p.start_date,
        end_date: p.end_date,
        goal_amount: p.goal_amount,
        commission_rate: p.commission_rate,
        is_active: p.is_active,
      });
    } else {
      this.form.reset({ goal_amount: 0, commission_rate: 5, is_active: true });
    }
  }

  submit(): void {
    if (this.form.invalid) {
      Object.values(this.form.controls).forEach(c => { c.markAsDirty(); c.updateValueAndValidity(); });
      return;
    }
    const v = this.form.value;
    this.save.emit({
      name: v.name!,
      start_date: this.toDateString(v.start_date as string | Date),
      end_date: this.toDateString(v.end_date as string | Date),
      goal_amount: v.goal_amount!,
      commission_rate: v.commission_rate!,
      is_active: v.is_active ?? true,
    });
  }
}
