import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { FormsModule } from '@angular/forms';
import { SuppliersApiService } from '../services/suppliers-api.service';
import { Supplier } from '../models/supplier.model';

@Component({
  selector: 'app-suppliers-list',
  standalone: true,
  imports: [RouterLink, NzTableModule, NzButtonModule, NzTagModule, NzInputModule, NzIconModule, FormsModule],
  template: `
    <div style="padding: 24px">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px">
        <h2 style="margin:0">Proveedores</h2>
        <button nz-button nzType="primary" routerLink="nuevo">+ Nuevo proveedor</button>
      </div>

      <div style="margin-bottom:16px">
        <nz-input-group [nzPrefix]="searchIcon" style="max-width:320px">
          <input nz-input placeholder="Buscar proveedor..." [(ngModel)]="search" (ngModelChange)="onSearch()" />
        </nz-input-group>
        <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
      </div>

      <nz-table
        [nzData]="items()"
        [nzTotal]="total()"
        [nzPageIndex]="page()"
        [nzPageSize]="20"
        [nzLoading]="isLoading()"
        nzShowSizeChanger
        (nzPageIndexChange)="onPageChange($event)">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Contacto</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (row of items(); track row.supplier_id) {
            <tr>
              <td>{{ row.name }}</td>
              <td>{{ row.contact_name ?? '—' }}</td>
              <td>{{ row.phone ?? '—' }}</td>
              <td>{{ row.email ?? '—' }}</td>
              <td>
                <nz-tag [nzColor]="row.is_active ? 'green' : 'default'">
                  {{ row.is_active ? 'Activo' : 'Inactivo' }}
                </nz-tag>
              </td>
              <td>
                <a nz-button nzType="link" [routerLink]="[row.supplier_id]">Ver</a>
                <a nz-button nzType="link" [routerLink]="[row.supplier_id, 'editar']">Editar</a>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `,
})
export class SuppliersListComponent implements OnInit {
  private readonly api = inject(SuppliersApiService);
  private readonly msg = inject(NzMessageService);

  readonly items = signal<Supplier[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly isLoading = signal(false);
  search = '';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getAll({ page: this.page(), limit: 20, search: this.search || undefined }).subscribe({
      next: (res) => {
        this.items.set(res.data);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => {
        this.msg.error('Error al cargar proveedores');
        this.isLoading.set(false);
      },
    });
  }

  onSearch(): void {
    this.page.set(1);
    this.load();
  }

  onPageChange(page: number): void {
    this.page.set(page);
    this.load();
  }
}
