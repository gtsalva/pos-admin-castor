import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsersApiService } from '../services/users-api.service';
import { User, UserRole } from '../models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN:       'Administrador',
  MANAGER:     'Gerente',
  CASHIER:     'Cajero',
  SALESPERSON: 'Vendedor',
};

const ROLE_COLOR: Record<UserRole, string> = {
  ADMIN:       'red',
  MANAGER:     'blue',
  CASHIER:     'purple',
  SALESPERSON: 'green',
};

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, DatePipe,
    NzTableModule, NzTagModule, NzButtonModule, NzIconModule,
    NzInputModule, NzPopconfirmModule, NzSpinModule, NzDividerModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      title="Usuarios"
      subtitle="Gestión de accesos al sistema"
    >
      <a nz-button nzType="primary" routerLink="nuevo">
        <span nz-icon nzType="plus"></span> Nuevo usuario
      </a>
    </app-page-header>

    <div style="margin-bottom:16px">
      <nz-input-group [nzPrefix]="searchIcon" style="max-width:320px">
        <input nz-input placeholder="Buscar por nombre o email..." [ngModel]="search()" (ngModelChange)="search.set($event)" />
      </nz-input-group>
      <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
    </div>

    <nz-table
      [nzData]="filtered()"
      [nzLoading]="isLoading()"
      nzSize="middle"
      [nzShowPagination]="filtered().length > 20"
      [nzPageSize]="20"
    >
      <thead>
        <tr>
          <th>Nombre</th>
          <th>Email</th>
          <th>Rol</th>
          <th>Estado</th>
          <th>Alta</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        @for (user of filtered(); track user.user_id) {
          <tr>
            <td style="font-weight:500">{{ user.full_name }}</td>
            <td>{{ user.email }}</td>
            <td>
              <nz-tag [nzColor]="roleColor(user.role)">{{ roleLabel(user.role) }}</nz-tag>
            </td>
            <td>
              <nz-tag [nzColor]="user.is_active ? 'green' : 'default'">
                {{ user.is_active ? 'Activo' : 'Inactivo' }}
              </nz-tag>
            </td>
            <td>{{ user.created_at | date:'dd/MM/yyyy' }}</td>
            <td>
              <a nz-button nzType="link" [routerLink]="[user.user_id, 'editar']">Editar</a>
              <nz-divider nzType="vertical" />
              <button
                nz-button nzType="link"
                [nzDanger]="user.is_active"
                nz-popconfirm
                [nzPopconfirmTitle]="user.is_active ? 'Desactivar usuario' : 'Activar usuario'"
                [nzOkText]="user.is_active ? 'Desactivar' : 'Activar'"
                nzCancelText="Cancelar"
                nzPopconfirmPlacement="left"
                (nzOnConfirm)="toggle(user)"
              >{{ user.is_active ? 'Desactivar' : 'Activar' }}</button>
            </td>
          </tr>
        }
      </tbody>
    </nz-table>
  `,
})
export class UsersListComponent implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly msg = inject(NzMessageService);

  readonly all = signal<User[]>([]);
  readonly isLoading = signal(false);
  readonly search = signal('');

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase();
    if (!q) return this.all();
    return this.all().filter(
      (u) => u.full_name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    );
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.api.getAll().subscribe({
      next: (users) => { this.all.set(users); this.isLoading.set(false); },
      error: () => { this.msg.error('Error al cargar usuarios'); this.isLoading.set(false); },
    });
  }

  toggle(user: User): void {
    this.api.toggleStatus(user.user_id).subscribe({
      next: (updated) => {
        this.all.update((list) => list.map((u) => u.user_id === updated.user_id ? updated : u));
        this.msg.success(`Usuario ${updated.is_active ? 'activado' : 'desactivado'}`);
      },
      error: () => this.msg.error('Error al cambiar estado'),
    });
  }

  roleLabel(role: UserRole): string { return ROLE_LABEL[role] ?? role; }
  roleColor(role: UserRole): string { return ROLE_COLOR[role] ?? 'default'; }
}
