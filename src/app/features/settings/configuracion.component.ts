import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StoreSettingsService } from '../../shared/services/store-settings.service';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [ReactiveFormsModule, NzCardModule, NzFormModule, NzInputModule, NzInputNumberModule, NzButtonModule],
  template: `
    <div style="max-width:520px;padding:24px">
      <nz-card nzTitle="Configuración de la tienda">
        <form nz-form [formGroup]="form" (ngSubmit)="save()" nzLayout="vertical">
          <nz-form-item>
            <nz-form-label nzRequired>Nombre de la tienda</nz-form-label>
            <nz-form-control nzErrorTip="Ingrese el nombre de la tienda">
              <input nz-input formControlName="store_name" placeholder="Mueblería El Castor" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>Margen de precio mínimo (%)</nz-form-label>
            <nz-form-control nzErrorTip="Valor entre 0 y 100" nzExtra="Se aplica sobre el costo para calcular el precio mínimo sugerido">
              <nz-input-number
                formControlName="min_price_margin"
                [nzMin]="0" [nzMax]="100" [nzStep]="1" [nzPrecision]="2"
                nzPlaceHolder="20" style="width:100%" />
            </nz-form-control>
          </nz-form-item>
          <nz-form-item>
            <nz-form-label nzRequired>Margen de precio de venta (%)</nz-form-label>
            <nz-form-control nzErrorTip="Valor entre 0 y 100" nzExtra="Se aplica sobre el costo para calcular el precio de venta sugerido">
              <nz-input-number
                formControlName="sale_price_margin"
                [nzMin]="0" [nzMax]="100" [nzStep]="1" [nzPrecision]="2"
                nzPlaceHolder="35" style="width:100%" />
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
    min_price_margin: new FormControl(this.storeSettings.min_price_margin(), [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
    sale_price_margin: new FormControl(this.storeSettings.sale_price_margin(), [
      Validators.required,
      Validators.min(0),
      Validators.max(100),
    ]),
  });

  async save(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.isSaving.set(true);
    try {
      const v = this.form.getRawValue();
      await this.storeSettings.update({
        store_name: v.store_name!,
        min_price_margin: v.min_price_margin!,
        sale_price_margin: v.sale_price_margin!,
      });
      this.message.success('Configuración guardada correctamente');
    } catch {
      this.message.error('No se pudo guardar la configuración');
    } finally {
      this.isSaving.set(false);
    }
  }
}
