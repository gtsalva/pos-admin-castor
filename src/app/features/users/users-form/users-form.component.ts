import { Component, OnInit, inject, signal, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { UsersApiService } from '../services/users-api.service';
import { UserRole } from '../models/user.model';
import { PageHeaderComponent, Breadcrumb } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule, NzInputModule, NzButtonModule, NzSelectModule, NzSpinModule,
    PageHeaderComponent,
  ],
  template: `
    <app-page-header
      [title]="userId() ? 'Editar usuario' : 'Nuevo usuario'"
      [breadcrumbs]="breadcrumbs"
    />

    @if (isLoadingUser()) {
      <nz-spin nzTip="Cargando..." style="display:block;text-align:center;padding:40px" />
    } @else {
      <form nz-form [formGroup]="form" nzLayout="vertical" (ngSubmit)="submit()" style="max-width:520px">
        <nz-form-item>
          <nz-form-label nzRequired>Nombre completo</nz-form-label>
          <nz-form-control nzErrorTip="Requerido">
            <input nz-input formControlName="full_name" placeholder="Juan Pérez" />
          </nz-form-control>
        </nz-form-item>

        <nz-form-item>
          <nz-form-label nzRequired>Email</nz-form-label>
          <nz-form-control nzErrorTip="Email válido requerido">
            <input nz-input formControlName="email" type="email" placeholder="juan@castor.gt" />
          </nz-form-control>
        </nz-form-item>

        @if (!userId()) {
          <nz-form-item>
            <nz-form-label nzRequired>Contraseña</nz-form-label>
            <nz-form-control nzErrorTip="Mínimo 8 caracteres">
              <input nz-input formControlName="password" type="password" placeholder="Mínimo 8 caracteres" />
            </nz-form-control>
          </nz-form-item>
        }

        <nz-form-item>
          <nz-form-label nzRequired>Rol</nz-form-label>
          <nz-form-control nzErrorTip="Selecciona un rol">
            <nz-select formControlName="role" nzPlaceHolder="Selecciona un rol" style="width:100%">
              <nz-option nzValue="ADMIN"       nzLabel="Administrador" />
              <nz-option nzValue="MANAGER"     nzLabel="Gerente" />
              <nz-option nzValue="CASHIER"     nzLabel="Cajero" />
              <nz-option nzValue="SALESPERSON" nzLabel="Vendedor" />
            </nz-select>
          </nz-form-control>
        </nz-form-item>

        <div style="display:flex; gap:8px; margin-top:8px">
          <button nz-button nzType="primary" [nzLoading]="isSaving()" [disabled]="form.invalid">
            Guardar
          </button>
          <button nz-button type="button" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    }
  `,
})
export class UsersFormComponent implements OnInit {
  readonly userId = input<string | undefined>();

  private readonly api = inject(UsersApiService);
  private readonly router = inject(Router);
  private readonly msg = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly isLoadingUser = signal(false);

  readonly breadcrumbs: Breadcrumb[] = [
    { label: 'Usuarios', route: '/usuarios' },
  ];

  form = this.fb.group({
    full_name: ['', [Validators.required]],
    email:     ['', [Validators.required, Validators.email]],
    password:  ['', []],
    role:      ['' as UserRole, [Validators.required]],
  });

  ngOnInit(): void {
    if (this.userId()) {
      this.form.get('password')!.clearValidators();
      this.form.get('password')!.updateValueAndValidity();
      this.isLoadingUser.set(true);
      this.api.getAll().subscribe({
        next: (users) => {
          const user = users.find((u) => u.user_id === this.userId());
          if (!user) { this.router.navigate(['/usuarios']); return; }
          this.form.patchValue({ full_name: user.full_name, email: user.email, role: user.role });
          this.isLoadingUser.set(false);
        },
        error: () => { this.msg.error('Error al cargar usuario'); this.isLoadingUser.set(false); },
      });
    } else {
      this.form.get('password')!.setValidators([Validators.required, Validators.minLength(8)]);
      this.form.get('password')!.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const raw = this.form.getRawValue();

    const req = this.userId()
      ? this.api.update(this.userId()!, {
          full_name: raw.full_name!,
          email:     raw.email!,
          role:      raw.role as UserRole,
        })
      : this.api.create({
          full_name: raw.full_name!,
          email:     raw.email!,
          password:  raw.password!,
          role:      raw.role as UserRole,
        });

    req.subscribe({
      next: () => {
        this.msg.success('Usuario guardado');
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Error al guardar';
        this.msg.error(msg);
        this.isSaving.set(false);
      },
    });
  }

  cancel(): void {
    this.router.navigate(['/usuarios']);
  }
}
