import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StoreSettingsService } from '../../shared/services/store-settings.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ReactiveFormsModule, NzCardModule, NzFormModule, NzInputModule, NzButtonModule],
  template: `
    <div style="max-width:480px;padding:24px">
      <nz-card nzTitle="Configuración de la tienda">
        <form nz-form [formGroup]="form" (ngSubmit)="save()" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Nombre de la tienda</nz-form-label>
            <nz-form-control nzErrorTip="Ingrese el nombre de la tienda">
              <input nz-input formControlName="store_name" placeholder="Mueblería El Castor" />
            </nz-form-control>
          </nz-form-item>
          <button nz-button nzType="primary" [nzLoading]="isSaving()" type="submit">
            Guardar
          </button>
        </form>
      </nz-card>
    </div>
  `,
})
export class ConfiguracionComponent {
  private readonly storeSettings = inject(StoreSettingsService);
  private readonly message = inject(NzMessageService);

  readonly isSaving = signal(false);

  readonly form = new FormGroup({
    store_name: new FormControl(this.storeSettings.store_name(), [
      Validators.required,
      Validators.maxLength(200),
    ]),
  });

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      await this.storeSettings.update(this.form.getRawValue().store_name!);
      this.message.success('Nombre guardado correctamente');
    } catch {
      this.message.error('No se pudo guardar el nombre');
    } finally {
      this.isSaving.set(false);
    }
  }
}
