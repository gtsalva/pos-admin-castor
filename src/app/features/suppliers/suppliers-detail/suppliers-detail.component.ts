import { Component, inject, signal, OnInit, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SuppliersApiService } from '../services/suppliers-api.service';
import { Supplier } from '../models/supplier.model';

@Component({
  selector: 'app-suppliers-detail',
  standalone: true,
  imports: [RouterLink, NzDescriptionsModule, NzButtonModule, NzTagModule, NzSpinModule],
  template: `
    <div style="padding:24px">
      @if (isLoading()) {
        <nz-spin nzSimple></nz-spin>
      } @else if (supplier()) {
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px">
          <div>
            <a routerLink="/proveedores">← Proveedores</a>
            <h2 style="margin:8px 0 0">{{ supplier()!.name }}</h2>
          </div>
          <a nz-button nzType="primary" [routerLink]="['editar']">Editar</a>
        </div>
        <nz-descriptions nzBordered nzSize="small" [nzColumn]="2">
          <nz-descriptions-item nzTitle="Nombre">{{ supplier()!.name }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Estado">
            <nz-tag [nzColor]="supplier()!.is_active ? 'green' : 'default'">
              {{ supplier()!.is_active ? 'Activo' : 'Inactivo' }}
            </nz-tag>
          </nz-descriptions-item>
          <nz-descriptions-item nzTitle="Contacto">{{ supplier()!.contact_name ?? '—' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Teléfono">{{ supplier()!.phone ?? '—' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Email">{{ supplier()!.email ?? '—' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Dirección" [nzSpan]="2">{{ supplier()!.address ?? '—' }}</nz-descriptions-item>
          <nz-descriptions-item nzTitle="Notas" [nzSpan]="2">{{ supplier()!.notes ?? '—' }}</nz-descriptions-item>
        </nz-descriptions>
      }
    </div>
  `,
})
export class SuppliersDetailComponent implements OnInit {
  readonly supplierId = input.required<string>();

  private readonly api = inject(SuppliersApiService);
  private readonly msg = inject(NzMessageService);

  readonly supplier = signal<Supplier | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.isLoading.set(true);
    this.api.getOne(this.supplierId()).subscribe({
      next: (s) => { this.supplier.set(s); this.isLoading.set(false); },
      error: () => { this.msg.error('Error al cargar proveedor'); this.isLoading.set(false); },
    });
  }
}
