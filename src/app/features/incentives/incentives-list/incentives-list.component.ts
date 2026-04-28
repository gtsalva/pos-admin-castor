import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { DecimalPipe, DatePipe } from '@angular/common';
import { IncentivesApiService } from '../services/incentives-api.service';
import { IncentivePeriod, CreatePeriodPayload, UpdatePeriodPayload } from '../models/incentive.model';
import { IncentivesFormComponent } from '../incentives-form/incentives-form.component';

@Component({
  selector: 'app-incentives-list',
  standalone: true,
  imports: [
    NzTableModule, NzTagModule, NzButtonModule, NzIconModule,
    NzPopconfirmModule, DecimalPipe, DatePipe, IncentivesFormComponent,
  ],
  templateUrl: './incentives-list.component.html',
})
export class IncentivesListComponent implements OnInit {
  private readonly api = inject(IncentivesApiService);
  private readonly msg = inject(NzMessageService);
  private readonly router = inject(Router);

  readonly periods = signal<IncentivePeriod[]>([]);
  readonly loading = signal(false);

  showForm = false;
  editPeriod: IncentivePeriod | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.getPeriods().subscribe({
      next: data => { this.periods.set(data); this.loading.set(false); },
      error: () => this.loading.set(false),
    });
  }

  openCreate(): void {
    this.editPeriod = null;
    this.showForm = true;
  }

  openEdit(period: IncentivePeriod): void {
    this.editPeriod = period;
    this.showForm = true;
  }

  onFormSave(payload: CreatePeriodPayload | UpdatePeriodPayload): void {
    if (this.editPeriod) {
      this.api.updatePeriod(this.editPeriod.period_id, payload as UpdatePeriodPayload).subscribe({
        next: () => { this.msg.success('Período actualizado'); this.showForm = false; this.load(); },
        error: () => this.msg.error('Error al actualizar período'),
      });
    } else {
      this.api.createPeriod(payload as CreatePeriodPayload).subscribe({
        next: () => { this.msg.success('Período creado'); this.showForm = false; this.load(); },
        error: () => this.msg.error('Error al crear período'),
      });
    }
  }

  toggleActive(period: IncentivePeriod): void {
    this.api.updatePeriod(period.period_id, { is_active: !period.is_active }).subscribe({
      next: () => { this.msg.success('Estado actualizado'); this.load(); },
      error: () => this.msg.error('Error al actualizar estado'),
    });
  }

  viewDetail(period_id: string): void {
    this.router.navigate(['/incentivos', period_id]);
  }
}
