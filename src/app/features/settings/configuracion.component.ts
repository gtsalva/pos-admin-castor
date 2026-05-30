import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMessageService } from 'ng-zorro-antd/message';
import { StoreSettingsService } from '../../shared/services/store-settings.service';
import { AdminToolsApiService, CleanupDeleted, CleanupReport } from '../../shared/services/admin-tools-api.service';

interface CleanupRow {
  label: string;
  key: keyof CleanupDeleted;
}

const CLEANUP_ROWS: CleanupRow[] = [
  { label: 'Ventas',                          key: 'sales' },
  { label: 'Ítems de venta',                  key: 'sale_items' },
  { label: 'Pagos de venta',                  key: 'sale_payments' },
  { label: 'Movimientos de inventario',       key: 'inventory_movements' },
  { label: 'Órdenes de compra',               key: 'purchase_orders' },
  { label: 'Ítems de orden de compra',        key: 'purchase_order_items' },
  { label: 'Cotizaciones',                    key: 'custom_orders' },
  { label: 'Ítems de cotización',             key: 'custom_order_items' },
  { label: 'Pagos de cotización',             key: 'custom_order_payments' },
  { label: 'Pagos de comisión (cotizaciones)',key: 'custom_order_commission_payments' },
  { label: 'Recibos de cotización',           key: 'custom_order_print_receipts' },
  { label: 'Conciliaciones de turno',          key: 'reconciliations' },
  { label: 'Cierres de turno',                key: 'shift_closes' },
  { label: 'Períodos de incentivo',           key: 'incentive_periods' },
  { label: 'Liquidaciones de incentivo',      key: 'incentive_liquidations' },
  { label: 'Clientes',                        key: 'clients' },
  { label: 'Proveedores',                     key: 'suppliers' },
  { label: 'Productos',                       key: 'products' },
  { label: 'Recursos de producto',            key: 'product_resources' },
  { label: 'Categorías (sin productos)',      key: 'categories' },
];

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzInputNumberModule,
    NzButtonModule,
    NzModalModule,
    NzTableModule,
    NzAlertModule,
    NzTagModule,
    NzDividerModule,
    NzIconModule,
  ],
  template: `
    <div style="max-width:620px;padding:24px;display:flex;flex-direction:column;gap:24px">

      <!-- ── Configuración de la tienda ── -->
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

      <!-- ── Herramientas de datos ── -->
      <nz-card nzTitle="Herramientas de datos">
        <nz-alert
          nzType="warning"
          nzShowIcon
          nzMessage="Zona de peligro"
          nzDescription="Las acciones de esta sección eliminan datos permanentemente. Usa 'Vista previa' primero para revisar qué se va a borrar antes de confirmar."
          style="margin-bottom:16px"
        />

        <p style="margin:0 0 16px;color:#5c4a42">
          <strong>Limpiar datos de prueba (seed)</strong><br />
          Elimina ventas, compras, cotizaciones, productos, clientes y proveedores generados
          automáticamente al iniciar el sistema por primera vez. No elimina usuarios.
        </p>

        <div style="display:flex;gap:8px">
          <button
            nz-button
            nzType="default"
            [nzLoading]="isPreviewing()"
            (click)="preview()"
          >
            <span nz-icon nzType="eye"></span>
            Vista previa
          </button>

          @if (previewReport()) {
            <button
              nz-button
              nzType="primary"
              nzDanger
              [nzLoading]="isExecuting()"
              [disabled]="totalToDelete() === 0"
              (click)="confirmExecute()"
            >
              <span nz-icon nzType="delete"></span>
              Ejecutar limpieza
            </button>
          }
        </div>

        @if (previewReport(); as r) {
          <nz-divider />
          @if (totalToDelete() === 0) {
            <nz-alert nzType="success" nzShowIcon nzMessage="No hay datos de prueba. La base está limpia." />
          } @else {
            <p style="margin:0 0 8px;font-weight:600">
              Registros que se eliminarán
              <nz-tag nzColor="error" style="margin-left:8px">{{ totalToDelete() }} total</nz-tag>
            </p>
            <nz-table
              [nzData]="previewRows()"
              [nzShowPagination]="false"
              nzSize="small"
              nzBordered
            >
              <thead>
                <tr>
                  <th>Tabla</th>
                  <th nzAlign="right">Registros</th>
                </tr>
              </thead>
              <tbody>
                @for (row of previewRows(); track row.key) {
                  @if (row.count > 0) {
                    <tr>
                      <td>{{ row.label }}</td>
                      <td nzAlign="right">
                        <nz-tag nzColor="warning">{{ row.count }}</nz-tag>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </nz-table>
          }
        }
      </nz-card>

    </div>
  `,
})
export class ConfiguracionComponent {
  private readonly storeSettings = inject(StoreSettingsService);
  private readonly message = inject(NzMessageService);
  private readonly modal = inject(NzModalService);
  private readonly adminTools = inject(AdminToolsApiService);

  readonly isSaving    = signal(false);
  readonly isPreviewing = signal(false);
  readonly isExecuting  = signal(false);
  readonly previewReport = signal<CleanupReport | null>(null);

  readonly previewRows = (): { label: string; key: keyof CleanupDeleted; count: number }[] => {
    const r = this.previewReport();
    if (!r) return [];
    return CLEANUP_ROWS.map(row => ({ ...row, count: r.deleted[row.key] }));
  };

  readonly totalToDelete = (): number => {
    const r = this.previewReport();
    if (!r) return 0;
    return Object.values(r.deleted).reduce((a, b) => a + b, 0);
  };

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

  preview(): void {
    this.isPreviewing.set(true);
    this.previewReport.set(null);
    this.adminTools.cleanupSeed(true).subscribe({
      next: r => {
        this.previewReport.set(r);
        this.isPreviewing.set(false);
      },
      error: () => {
        this.message.error('No se pudo obtener la vista previa');
        this.isPreviewing.set(false);
      },
    });
  }

  confirmExecute(): void {
    const total = this.totalToDelete();
    this.modal.confirm({
      nzTitle: '¿Confirmas la limpieza de datos de prueba?',
      nzContent: `Se eliminarán <strong>${total} registros</strong> de manera permanente. Esta acción no se puede deshacer.`,
      nzOkText: 'Sí, eliminar',
      nzOkDanger: true,
      nzCancelText: 'Cancelar',
      nzOnOk: () => this.execute(),
    });
  }

  private execute(): void {
    this.isExecuting.set(true);
    this.adminTools.cleanupSeed(false).subscribe({
      next: r => {
        const total = Object.values(r.deleted).reduce((a, b) => a + b, 0);
        this.message.success(`Limpieza completada: ${total} registros eliminados`);
        this.previewReport.set(null);
        this.isExecuting.set(false);
      },
      error: () => {
        this.message.error('Error durante la limpieza. No se eliminó nada.');
        this.isExecuting.set(false);
      },
    });
  }
}
