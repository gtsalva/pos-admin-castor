import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzCheckboxModule, NzAvatarModule, NzIconModule, NzDividerModule],
  template: `
    <div style="padding:24px; max-width:600px">
      <h2>{{ supplierId() ? 'Editar proveedor' : 'Nuevo proveedor' }}</h2>

      @if (supplierId()) {
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:28px;padding:20px;background:#FBF5EF;border-radius:12px;border:1px solid #EDE0D4">
          @if (photoUrl()) {
            <nz-avatar [nzSrc]="photoUrl()!" [nzSize]="80" />
          } @else {
            <nz-avatar [nzText]="(form.value.name || 'P')[0].toUpperCase()" [nzSize]="80"
              style="background:#C85A1A;color:#fff;font-size:28px;font-weight:700" />
          }
          <div>
            <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:#8C7B75;margin-bottom:6px">
              Logo / Fotografía
            </div>
            <button nz-button nzType="default" nzSize="small" type="button"
              [nzLoading]="isUploadingPhoto()" (click)="photoInput.click()">
              <span nz-icon nzType="picture"></span>
              {{ photoUrl() ? 'Cambiar foto' : 'Subir foto' }}
            </button>
            @if (photoUrl()) {
              <nz-divider nzType="vertical" />
              <button nz-button nzType="link" nzDanger nzSize="small" type="button"
                (click)="removePhoto()">Eliminar</button>
            }
            <div style="font-size:11px;color:#AAA;margin-top:4px">JPEG, PNG o WebP · máx. 5 MB</div>
          </div>
        </div>
        <input #photoInput type="file" accept="image/jpeg,image/png,image/webp"
          style="display:none" (change)="onPhotoChange($event)" />
      }

      <form nz-form [formGroup]="form" nzLayout="vertical" (ngSubmit)="submit()">
        <nz-form-item>
          <nz-form-label nzRequired>Nombre</nz-form-label>
          <nz-form-control nzErrorTip="Requerido">
            <input nz-input formControlName="name" placeholder="Distribuidora El Roble" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>Nombre de contacto</nz-form-label>
          <nz-form-control>
            <input nz-input formControlName="contact_name" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>Teléfono</nz-form-label>
          <nz-form-control>
            <input nz-input formControlName="phone" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>Email</nz-form-label>
          <nz-form-control nzErrorTip="Email inválido">
            <input nz-input formControlName="email" type="email" />
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>Dirección</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="address" [nzAutosize]="{ minRows: 2 }"></textarea>
          </nz-form-control>
        </nz-form-item>
        <nz-form-item>
          <nz-form-label>Notas</nz-form-label>
          <nz-form-control>
            <textarea nz-input formControlName="notes" [nzAutosize]="{ minRows: 2 }"></textarea>
          </nz-form-control>
        </nz-form-item>
        @if (supplierId()) {
          <nz-form-item>
            <nz-form-control>
              <label nz-checkbox formControlName="is_active">Proveedor activo</label>
            </nz-form-control>
          </nz-form-item>
        }
        <div style="display:flex; gap:8px">
          <button nz-button nzType="primary" [nzLoading]="isSaving()" [disabled]="form.invalid">
            Guardar
          </button>
          <button nz-button type="button" (click)="cancel()">Cancelar</button>
        </div>
      </form>
    </div>
  `,
})
export class SuppliersFormComponent implements OnInit {
  readonly supplierId = input<string | undefined>();

  private readonly api = inject(SuppliersApiService);
  private readonly router = inject(Router);
  private readonly msg = inject(NzMessageService);
  private readonly fb = inject(FormBuilder);

  readonly isSaving = signal(false);
  readonly photoUrl = signal<string | null>(null);
  readonly isUploadingPhoto = signal(false);

  form = this.fb.group({
    name:         ['', [Validators.required, Validators.maxLength(150)]],
    contact_name: [''],
    phone:        [''],
    email:        ['', [Validators.email]],
    address:      [''],
    notes:        [''],
    is_active:    [true],
  });

  ngOnInit(): void {
    if (this.supplierId()) {
      this.api.getOne(this.supplierId()!).subscribe((s) => {
        this.form.patchValue({
          name:         s.name,
          contact_name: s.contact_name ?? '',
          phone:        s.phone ?? '',
          email:        s.email ?? '',
          address:      s.address ?? '',
          notes:        s.notes ?? '',
          is_active:    s.is_active,
        });
        this.photoUrl.set(s.photo_url);
      });
    }
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const raw = this.form.getRawValue();
    const payload = {
      name:         raw.name!,
      contact_name: raw.contact_name || undefined,
      phone:        raw.phone || undefined,
      email:        raw.email || undefined,
      address:      raw.address || undefined,
      notes:        raw.notes || undefined,
    };

    const req = this.supplierId()
      ? this.api.update(this.supplierId()!, { ...payload, is_active: raw.is_active! })
      : this.api.create(payload);

    req.subscribe({
      next: (s) => {
        this.msg.success('Proveedor guardado');
        this.router.navigate(['/proveedores', s.supplier_id]);
      },
      error: () => {
        this.msg.error('Error al guardar');
        this.isSaving.set(false);
      },
    });
  }

  onPhotoChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file || !this.supplierId()) return;
    this.isUploadingPhoto.set(true);
    this.api.uploadPhoto(this.supplierId()!, file).subscribe({
      next: (s) => { this.photoUrl.set(s.photo_url); this.isUploadingPhoto.set(false); },
      error: () => { this.msg.error('Error al subir la foto'); this.isUploadingPhoto.set(false); },
    });
  }

  removePhoto(): void {
    if (!this.supplierId()) return;
    this.isUploadingPhoto.set(true);
    this.api.removePhoto(this.supplierId()!).subscribe({
      next: () => { this.photoUrl.set(null); this.isUploadingPhoto.set(false); },
      error: () => { this.msg.error('Error al eliminar la foto'); this.isUploadingPhoto.set(false); },
    });
  }

  cancel(): void {
    this.router.navigate(['/proveedores']);
  }
}
