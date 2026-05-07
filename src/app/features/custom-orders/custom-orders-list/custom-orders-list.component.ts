import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NzTableModule }    from 'ng-zorro-antd/table';
import { NzTagModule }      from 'ng-zorro-antd/tag';
import { NzButtonModule }   from 'ng-zorro-antd/button';
import { NzSelectModule }   from 'ng-zorro-antd/select';
import { NzIconModule }     from 'ng-zorro-antd/icon';
import { NzSpaceModule }    from 'ng-zorro-antd/space';
import { NzFormModule }     from 'ng-zorro-antd/form';
import { QuetzalesPipe }    from '../../../shared/pipes/quetzales.pipe';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CustomOrdersStateService } from '../services/custom-orders-state.service';
import { CustomOrder, CustomOrderStatus } from '../models/custom-order.model';

@Component({
  selector: 'app-custom-orders-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, DatePipe, NzTableModule, NzTagModule, NzButtonModule,
    NzSelectModule, NzIconModule, NzSpaceModule, NzFormModule,
    QuetzalesPipe,
    PageHeaderComponent,
  ],
  providers: [CustomOrdersStateService],
  templateUrl: './custom-orders-list.component.html',
  styleUrl: './custom-orders-list.component.less',
})
export class CustomOrdersListComponent implements OnInit {
  readonly state  = inject(CustomOrdersStateService);
  private readonly router = inject(Router);
  private readonly fb     = inject(FormBuilder);

  readonly filterForm = this.fb.group({ status: [null as CustomOrderStatus | null] });

  readonly statusOptions: { label: string; value: CustomOrderStatus }[] = [
    { label: 'Borrador',      value: 'DRAFT'         },
    { label: 'Enviada',       value: 'SENT'          },
    { label: 'Aprobada',      value: 'APPROVED'      },
    { label: 'En producción', value: 'IN_PRODUCTION' },
    { label: 'Entregada',     value: 'DELIVERED'     },
    { label: 'Completada',    value: 'COMPLETED'     },
    { label: 'Cancelada',     value: 'CANCELLED'     },
  ];

  readonly statusColors: Record<CustomOrderStatus, string> = {
    DRAFT:         'default',
    SENT:          'blue',
    APPROVED:      'cyan',
    IN_PRODUCTION: 'orange',
    DELIVERED:     'purple',
    COMPLETED:     'success',
    CANCELLED:     'error',
  };

  readonly statusLabels: Record<CustomOrderStatus, string> = {
    DRAFT:         'Borrador',
    SENT:          'Enviada',
    APPROVED:      'Aprobada',
    IN_PRODUCTION: 'En producción',
    DELIVERED:     'Entregada',
    COMPLETED:     'Completada',
    CANCELLED:     'Cancelada',
  };

  ngOnInit(): void { this.state.load(); }

  applyFilters(): void {
    const { status } = this.filterForm.value;
    this.state.load(status ? { status } : {});
  }

  clearFilters(): void {
    this.filterForm.reset();
    this.state.load();
  }

  openDetail(order: CustomOrder): void {
    this.router.navigate(['/cotizaciones', order.custom_order_id]);
  }

  clientLabel(o: CustomOrder): string {
    return o.client?.full_name ?? o.client_name ?? '—';
  }

  balanceOf(o: CustomOrder): number {
    return Math.max(0, o.total - o.total_paid);
  }
}
