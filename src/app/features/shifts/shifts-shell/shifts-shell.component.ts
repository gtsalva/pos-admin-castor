import { Component, signal } from '@angular/core';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { GlobalCloseComponent } from '../global-close/global-close.component';
import { ReconciliationComponent } from '../reconciliation/reconciliation.component';
import { DailySummaryEntry } from '../models/shift.model';

@Component({
  selector: 'app-shifts-shell',
  standalone: true,
  imports: [NzTabsModule, NzModalModule, GlobalCloseComponent, ReconciliationComponent],
  templateUrl: './shifts-shell.component.html',
})
export class ShiftsShellComponent {
  readonly reconcileEntry = signal<DailySummaryEntry | null>(null);
  readonly reconcileVisible = signal(false);

  onReconcileRequested(entry: DailySummaryEntry): void {
    this.reconcileEntry.set(entry);
    this.reconcileVisible.set(true);
  }

  onReconcileDone(): void {
    this.reconcileVisible.set(false);
    this.reconcileEntry.set(null);
  }
}
