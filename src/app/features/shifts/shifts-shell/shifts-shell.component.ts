import { Component, signal, ViewChild } from '@angular/core';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { GlobalCloseComponent } from '../global-close/global-close.component';
import { ReconciliationComponent } from '../reconciliation/reconciliation.component';
import { DailySummaryEntry } from '../models/shift.model';

@Component({
  selector: 'app-shifts-shell',
  standalone: true,
  imports: [NzModalModule, GlobalCloseComponent, ReconciliationComponent],
  templateUrl: './shifts-shell.component.html',
})
export class ShiftsShellComponent {
  @ViewChild(GlobalCloseComponent) private globalClose!: GlobalCloseComponent;

  readonly reconcileEntry = signal<DailySummaryEntry | null>(null);
  readonly reconcileVisible = signal(false);

  onReconcileRequested(entry: DailySummaryEntry): void {
    this.reconcileEntry.set(entry);
    this.reconcileVisible.set(true);
  }

  onReconcileDone(): void {
    this.reconcileVisible.set(false);
    this.reconcileEntry.set(null);
    this.globalClose.loadSummary();
  }
}
