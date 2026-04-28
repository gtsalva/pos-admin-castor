import { Component, inject, signal, OnInit, input } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzMessageService } from 'ng-zorro-antd/message';
import { SuppliersApiService } from '../services/suppliers-api.service';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [ReactiveFormsModule, NzFormModule, NzInputModule, NzButtonModule, NzCheckboxModule],
  template: `
    <div style="padding:24px; max-width:600px">
      <h2>{{ supplierId() ? 'Editar proveedor' : 'Nuevo proveedor' }}</h2>
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

  cancel(): void {
    this.router.navigate(['/proveedores']);
  }
}
