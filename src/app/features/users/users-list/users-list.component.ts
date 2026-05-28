import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { UsersApiService } from '../services/users-api.service';
import { User, UserRole } from '../models/user.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { AuthService } from '../../../core/services/auth.service';

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

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const parent = control.parent;
  if (!parent) return null;
  const new_password = parent.get('new_password')?.value;
  return control.value === new_password ? null : { mismatch: true };
}

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    RouterLink, FormsModule, ReactiveFormsModule, DatePipe,
    NzTableModule, NzTagModule, NzButtonModule, NzIconModule,
    NzInputModule, NzAvatarModule, NzPopconfirmModule, NzSpinModule,
    NzDividerModule, NzModalModule, NzFormModule,
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
          <th nzWidth="56px"></th>
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
            <td>
              @if (user.photo_url) {
                <nz-avatar [nzSrc]="user.photo_url" [nzSize]="36" />
              } @else {
                <nz-avatar [nzText]="initials(user.full_name)" [nzSize]="36"
                  style="background:#C85A1A;color:#fff;font-size:13px;font-weight:600" />
              }
            </td>
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
              <button nz-button nzType="link" (click)="openResetModal(user)">
                <span nz-icon nzType="key"></span> Contraseña
              </button>
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

    <!-- Modal reset de contraseña -->
    <nz-modal
      [nzVisible]="resetModalVisible()"
      [nzTitle]="'Resetear contraseña — ' + (resetTarget()?.full_name ?? '')"
      nzOkText="Cambiar contraseña"
      nzCancelText="Cancelar"
      [nzOkLoading]="resetLoading()"
      [nzOkDisabled]="resetForm.invalid"
      (nzOnOk)="submitReset()"
      (nzOnCancel)="closeResetModal()"
      nzWidth="420px"
    >
      <ng-container *nzModalContent>
        <form nz-form [formGroup]="resetForm" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Nueva contraseña</nz-form-label>
            <nz-form-control nzErrorTip="Mínimo 8 caracteres">
              <nz-input-group [nzSuffix]="toggleNew">
                <input
                  nz-input
                  [type]="showNew() ? 'text' : 'password'"
                  formControlName="new_password"
                  placeholder="Mínimo 8 caracteres"
                />
              </nz-input-group>
              <ng-template #toggleNew>
                <span nz-icon [nzType]="showNew() ? 'eye-invisible' : 'eye'"
                  style="cursor:pointer" (click)="showNew.set(!showNew())"></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>

          <nz-form-item>
            <nz-form-label nzRequired>Confirmar contraseña</nz-form-label>
            <nz-form-control nzErrorTip="Las contraseñas no coinciden">
              <nz-input-group [nzSuffix]="toggleConfirm">
                <input
                  nz-input
                  [type]="showConfirm() ? 'text' : 'password'"
                  formControlName="confirm_password"
                  placeholder="Repetir la nueva contraseña"
                />
              </nz-input-group>
              <ng-template #toggleConfirm>
                <span nz-icon [nzType]="showConfirm() ? 'eye-invisible' : 'eye'"
                  style="cursor:pointer" (click)="showConfirm.set(!showConfirm())"></span>
              </ng-template>
            </nz-form-control>
          </nz-form-item>
        </form>
      </ng-container>
    </nz-modal>
  `,
})
export class UsersListComponent implements OnInit {
  private readonly api = inject(UsersApiService);
  private readonly msg = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);
  readonly auth = inject(AuthService);

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

  // Reset modal state
  readonly resetModalVisible = signal(false);
  readonly resetTarget = signal<User | null>(null);
  readonly resetLoading = signal(false);
  readonly showNew = signal(false);
  readonly showConfirm = signal(false);

  readonly resetForm = this.fb.group({
    new_password:     ['', [Validators.required, Validators.minLength(8)]],
    confirm_password: ['', [Validators.required, passwordMatchValidator]],
  });

  ngOnInit(): void {
    this.load();
    // Re-validate confirm when new_password changes
    this.resetForm.get('new_password')?.valueChanges.subscribe(() => {
      this.resetForm.get('confirm_password')?.updateValueAndValidity();
    });
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

  openResetModal(user: User): void {
    this.resetTarget.set(user);
    this.resetForm.reset();
    this.showNew.set(false);
    this.showConfirm.set(false);
    this.resetModalVisible.set(true);
  }

  closeResetModal(): void {
    this.resetModalVisible.set(false);
    this.resetTarget.set(null);
  }

  submitReset(): void {
    if (this.resetForm.invalid) return;
    const target = this.resetTarget();
    if (!target) return;

    this.resetLoading.set(true);
    const { new_password } = this.resetForm.getRawValue();
    this.api.resetPassword(target.user_id, new_password!).subscribe({
      next: () => {
        this.msg.success(`Contraseña de ${target.full_name} actualizada`);
        this.resetLoading.set(false);
        this.closeResetModal();
      },
      error: () => {
        this.msg.error('Error al resetear contraseña');
        this.resetLoading.set(false);
      },
    });
  }

  initials(name: string): string {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  roleLabel(role: UserRole): string { return ROLE_LABEL[role] ?? role; }
  roleColor(role: UserRole): string { return ROLE_COLOR[role] ?? 'default'; }
}
