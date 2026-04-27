import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Sale } from '../../../shared/models/sale.model';
import { SalesApiService } from '../services/sales-api.service';

@Component({
  selector: 'app-sale-detail',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CurrencyPipe,
    DatePipe,
    NzDescriptionsModule,
    NzTagModule,
    NzButtonModule,
    NzDividerModule,
    NzModalModule,
    NzInputModule,
    NzFormModule,
    NzSpinModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzIconModule,
  ],
  templateUrl: './sale-detail.component.html',
  styleUrl: './sale-detail.component.less',
})
export class SaleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(SalesApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly sale = signal<Sale | null>(null);
  readonly isLoading = signal(false);
  readonly voidModalVisible = signal(false);
  readonly voiding = signal(false);

  readonly voidForm = this.fb.group({
    void_reason: ['', [Validators.required, Validators.minLength(5)]],
  });

  readonly paymentLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/ventas']); return; }

    this.isLoading.set(true);
    this.api.getSale(id).subscribe({
      next: s => { this.sale.set(s); this.isLoading.set(false); },
      error: () => { this.isLoading.set(false); this.router.navigate(['/ventas']); },
    });
  }

  openVoidModal(): void {
    this.voidForm.reset();
    this.voidModalVisible.set(true);
  }

  confirmVoid(): void {
    if (this.voidForm.invalid) return;
    const s = this.sale();
    if (!s) return;

    this.voiding.set(true);
    const void_reason = this.voidForm.value.void_reason!;
    this.api.voidSale(s.sale_id, void_reason).subscribe({
      next: updated => {
        this.sale.set(updated);
        this.voidModalVisible.set(false);
        this.voiding.set(false);
        this.message.success('Venta anulada correctamente');
      },
      error: (err: { error?: { message?: string } }) => {
        this.voiding.set(false);
        this.message.error(err?.error?.message ?? 'Error al anular la venta');
      },
    });
  }
}
