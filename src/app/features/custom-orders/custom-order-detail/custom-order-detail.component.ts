import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzTagModule }          from 'ng-zorro-antd/tag';
import { NzButtonModule }       from 'ng-zorro-antd/button';
import { NzDividerModule }      from 'ng-zorro-antd/divider';
import { NzModalModule }        from 'ng-zorro-antd/modal';
import { NzInputModule }        from 'ng-zorro-antd/input';
import { NzInputNumberModule }  from 'ng-zorro-antd/input-number';
import { NzFormModule }         from 'ng-zorro-antd/form';
import { NzSelectModule }       from 'ng-zorro-antd/select';
import { NzDatePickerModule }   from 'ng-zorro-antd/date-picker';
import { NzSpinModule }         from 'ng-zorro-antd/spin';
import { NzTableModule }        from 'ng-zorro-antd/table';
import { NzBreadCrumbModule }   from 'ng-zorro-antd/breadcrumb';
import { NzIconModule }         from 'ng-zorro-antd/icon';
import { NzProgressModule }     from 'ng-zorro-antd/progress';
import { NzMessageService }     from 'ng-zorro-antd/message';
import { QuetzalesPipe }        from '../../../shared/pipes/quetzales.pipe';
import { CustomOrdersApiService } from '../services/custom-orders-api.service';
import { CustomOrder, CustomOrderStatus, RegisterPaymentPayload, RegisterCommissionPaymentPayload, PaymentMethod } from '../models/custom-order.model';

@Component({
  selector: 'app-custom-order-detail',
  standalone: true,
  imports: [
    RouterLink, ReactiveFormsModule, FormsModule, DatePipe, QuetzalesPipe,
    NzDescriptionsModule, NzTagModule, NzButtonModule, NzDividerModule,
    NzModalModule, NzInputModule, NzInputNumberModule, NzFormModule,
    NzSelectModule, NzDatePickerModule, NzSpinModule, NzTableModule,
    NzBreadCrumbModule, NzIconModule, NzProgressModule,
  ],
  templateUrl: './custom-order-detail.component.html',
  styleUrl: './custom-order-detail.component.less',
})
export class CustomOrderDetailComponent implements OnInit {
  private readonly route   = inject(ActivatedRoute);
  private readonly router  = inject(Router);
  private readonly api     = inject(CustomOrdersApiService);
  private readonly message = inject(NzMessageService);
  private readonly fb      = inject(FormBuilder);

  readonly order   = signal<CustomOrder | null>(null);
  readonly loading = signal(false);
  readonly acting  = signal(false);

  readonly paymentModalVisible  = signal(false);
  readonly approveModalVisible  = signal(false);
  readonly deliveryModalVisible = signal(false);

  readonly paymentForm = this.fb.group({
    payment_method:    ['CASH' as PaymentMethod, Validators.required],
    amount:            [0, [Validators.required, Validators.min(0.01)]],
    payment_reference: [''],
    notes:             [''],
  });

  readonly approveForm = this.fb.group({
    delivery_date: [null as Date | null, Validators.required],
  });

  readonly deliveryForm = this.fb.group({
    delivery_date: [null as Date | null, Validators.required],
  });

  readonly statusColors: Record<CustomOrderStatus, string> = {
    DRAFT: 'default', SENT: 'blue', APPROVED: 'cyan',
    IN_PRODUCTION: 'orange', DELIVERED: 'purple', COMPLETED: 'success', CANCELLED: 'error',
  };
  readonly statusLabels: Record<CustomOrderStatus, string> = {
    DRAFT: 'Borrador', SENT: 'Enviada', APPROVED: 'Aprobada',
    IN_PRODUCTION: 'En producción', DELIVERED: 'Entregada', COMPLETED: 'Completada', CANCELLED: 'Cancelada',
  };
  readonly paymentLabels: Record<string, string> = {
    CASH: 'Efectivo', CARD: 'Tarjeta', TRANSFER: 'Transferencia', VISACUOTAS: 'Visa Cuotas',
  };
  readonly paymentMethods = [
    { label: 'Efectivo',      value: 'CASH'       },
    { label: 'Tarjeta',       value: 'CARD'        },
    { label: 'Transferencia', value: 'TRANSFER'    },
    { label: 'Visa Cuotas',   value: 'VISACUOTAS'  },
  ];

  readonly paidPercent = computed(() => {
    const o = this.order();
    if (!o || o.total === 0) return 0;
    return Math.min(100, Math.round((o.total_paid / o.total) * 100));
  });

  readonly balance = computed(() => {
    const o = this.order();
    return o ? Math.max(0, o.total - o.total_paid) : 0;
  });

  readonly commissionValue = signal<number | null>(null);
  readonly savingCommission = signal(false);

  readonly commissionTotalPaid = computed(() =>
    (this.order()?.commission_payments ?? []).reduce((s, cp) => s + cp.amount, 0)
  );
  readonly commissionBalance = computed(() => {
    const agreed = this.order()?.custom_commission ?? 0;
    return Math.max(0, agreed - this.commissionTotalPaid());
  });

  readonly commissionPaymentModalVisible = signal(false);
  readonly commissionPaymentForm = this.fb.group({
    amount: [0, [Validators.required, Validators.min(0.01)]],
    notes:  [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) { this.router.navigate(['/cotizaciones']); return; }
    this.loadOrder(id);
  }

  loadOrder(id: string): void {
    this.loading.set(true);
    this.api.getOne(id).subscribe({
      next: o => {
        this.order.set(o);
        this.commissionValue.set(o.custom_commission);
        this.loading.set(false);
      },
      error: () => { this.loading.set(false); this.router.navigate(['/cotizaciones']); },
    });
  }

  saveCommission(): void {
    const id = this.order()?.custom_order_id;
    if (!id) return;
    this.savingCommission.set(true);
    this.api.update(id, { custom_commission: this.commissionValue() }).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.commissionValue.set(updated.custom_commission);
        this.savingCommission.set(false);
        this.message.success('Comisión guardada');
      },
      error: (err: { error?: { message?: string } }) => {
        this.savingCommission.set(false);
        this.message.error(err?.error?.message ?? 'Error al guardar comisión');
      },
    });
  }

  clientLabel(): string {
    const o = this.order();
    return o?.client?.full_name ?? o?.client_name ?? '—';
  }

  act(action$: ReturnType<typeof this.api.send>): void {
    this.acting.set(true);
    action$.subscribe({
      next: (updated) => { this.order.set(updated); this.acting.set(false); },
      error: (err: { error?: { message?: string } }) => {
        this.acting.set(false);
        this.message.error(err?.error?.message ?? 'Error al actualizar');
      },
    });
  }

  send():           void { this.act(this.api.send(this.order()!.custom_order_id)); }
  markProduction(): void { this.act(this.api.markProduction(this.order()!.custom_order_id)); }
  markDelivered():  void { this.act(this.api.markDelivered(this.order()!.custom_order_id)); }
  cancel():         void { this.act(this.api.cancel(this.order()!.custom_order_id)); }

  openCommissionPaymentModal(): void {
    this.commissionPaymentForm.reset({ amount: 0, notes: '' });
    this.commissionPaymentModalVisible.set(true);
  }

  confirmCommissionPayment(): void {
    if (this.commissionPaymentForm.invalid) return;
    const v = this.commissionPaymentForm.value;
    const payload: RegisterCommissionPaymentPayload = {
      amount: Number(v.amount),
      notes:  v.notes || undefined,
    };
    this.commissionPaymentModalVisible.set(false);
    this.acting.set(true);
    this.api.registerCommissionPayment(this.order()!.custom_order_id, payload).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.acting.set(false);
        this.message.success(`Pago de comisión de Q ${payload.amount.toFixed(2)} registrado`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.acting.set(false);
        this.message.error(err?.error?.message ?? 'Error al registrar pago de comisión');
      },
    });
  }

  openApproveModal(): void {
    this.approveForm.reset();
    this.approveModalVisible.set(true);
  }

  confirmApprove(): void {
    if (this.approveForm.invalid) return;
    const d = this.approveForm.value.delivery_date as Date;
    const dateStr = d.toISOString().split('T')[0];
    this.approveModalVisible.set(false);
    this.act(this.api.approve(this.order()!.custom_order_id, dateStr));
  }

  openDeliveryModal(): void {
    const o = this.order();
    const d = o?.delivery_date ? new Date(o.delivery_date) : null;
    this.deliveryForm.patchValue({ delivery_date: d });
    this.deliveryModalVisible.set(true);
  }

  confirmDeliveryDate(): void {
    if (this.deliveryForm.invalid) return;
    const d = this.deliveryForm.value.delivery_date as Date;
    const dateStr = d.toISOString().split('T')[0];
    this.deliveryModalVisible.set(false);
    this.acting.set(true);
    this.api.updateDeliveryDate(this.order()!.custom_order_id, dateStr).subscribe({
      next: (updated) => { this.order.set(updated); this.acting.set(false); },
      error: () => this.acting.set(false),
    });
  }

  openPaymentModal(): void {
    const remaining = this.balance();
    this.paymentForm.reset({ payment_method: 'CASH', amount: Math.max(0, remaining) });
    this.paymentModalVisible.set(true);
  }

  confirmPayment(): void {
    if (this.paymentForm.invalid) return;
    const v = this.paymentForm.value;
    const payload: RegisterPaymentPayload = {
      payment_method:    v.payment_method as PaymentMethod,
      amount:            Number(v.amount),
      payment_reference: v.payment_reference || undefined,
      notes:             v.notes || undefined,
    };
    this.paymentModalVisible.set(false);
    this.acting.set(true);
    this.api.registerPayment(this.order()!.custom_order_id, payload).subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.acting.set(false);
        this.message.success(`Pago de Q ${payload.amount.toFixed(2)} registrado`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.acting.set(false);
        this.message.error(err?.error?.message ?? 'Error al registrar pago');
      },
    });
  }
}
