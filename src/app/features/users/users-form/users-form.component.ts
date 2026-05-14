import { Component, OnInit, inject, signal, input, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { UsersApiService } from '../services/users-api.service';
import { User, UserRole } from '../models/user.model';
import { PageHeaderComponent, Breadcrumb } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-users-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzFormModule, NzInputModule, NzButtonModule, NzSelectModule,
    NzAvatarModule, NzSpinModule, NzIconModule, NzDividerModule,
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

      @if (userId()) {
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;padding:20px;background:#FBF5EF;border-radius:12px;border:1px solid #EDE0D4">
          @if (currentUser()?.photo_url) {
            <nz-avatar [nzSrc]="currentUser()!.photo_url!" [nzSize]="80" />
          } @else {
            <nz-avatar
              [nzText]="avatarInitials()"
              [nzSize]="80"
              style="background:#C85A1A;color:#fff;font-size:28px;font-weight:700"
            />
          }
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#8C7B75;margin-bottom:6px">
              Fotografía del usuario
            </div>
            <button nz-button nzType="default" nzSize="small" type="button"
              [nzLoading]="isUploadingPhoto()"
              (click)="photoInput.click()">
              <span nz-icon nzType="camera"></span>
              {{ currentUser()?.photo_url ? 'Cambiar foto' : 'Subir foto' }}
            </button>
            @if (currentUser()?.photo_url) {
              <nz-divider nzType="vertical" />
              <button nz-button nzType="link" nzDanger nzSize="small" type="button"
                (click)="removePhoto()">
                Eliminar
              </button>
            }
            <div style="font-size:11px;color:#AAA;margin-top:4px">JPEG, PNG o WebP · máx. 5 MB</div>
          </div>
        </div>
        <input #photoInput type="file" accept="image/jpeg,image/png,image/webp"
          style="display:none" (change)="onPhotoChange($event)" />
      }

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
  private readonly authService = inject(AuthService);

  readonly isSaving = signal(false);
  readonly isLoadingUser = signal(false);
  readonly isUploadingPhoto = signal(false);
  readonly currentUser = signal<User | null>(null);

  readonly avatarInitials = computed(() => {
    const name = this.currentUser()?.full_name ?? '';
    return name.split(' ').slice(0, 2).map((w: string) => w[0]).join('').toUpperCase();
  });

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
      this.api.getById(this.userId()!).subscribe({
        next: (user) => {
          if (!user) { this.router.navigate(['/usuarios']); return; }
          this.currentUser.set(user);
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

  onPhotoChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.isUploadingPhoto.set(true);
    this.api.uploadPhoto(this.userId()!, file).subscribe({
      next: (updated) => {
        this.currentUser.set(updated);
        if (this.userId() === this.authService.currentUser()?.user_id) {
          this.authService.updatePhoto(updated.photo_url);
        }
        this.msg.success('Fotografía actualizada');
        this.isUploadingPhoto.set(false);
        input.value = '';
      },
      error: () => {
        this.msg.error('Error al subir la fotografía');
        this.isUploadingPhoto.set(false);
        input.value = '';
      },
    });
  }

  removePhoto(): void {
    this.isUploadingPhoto.set(true);
    this.api.update(this.userId()!, { photo_url: null } as never).subscribe({
      next: (updated) => {
        this.currentUser.set(updated);
        if (this.userId() === this.authService.currentUser()?.user_id) {
          this.authService.updatePhoto(null);
        }
        this.msg.success('Fotografía eliminada');
        this.isUploadingPhoto.set(false);
      },
      error: () => {
        this.msg.error('Error al eliminar la fotografía');
        this.isUploadingPhoto.set(false);
      },
    });
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
        this.isSaving.set(false);
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
