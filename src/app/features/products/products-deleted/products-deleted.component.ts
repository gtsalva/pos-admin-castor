import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ProductsApiService } from '../services/products-api.service';
import { Product } from '../../../shared/models/product.model';
import { PaginatedResult } from '../../../shared/models/pagination.model';

@Component({
  selector: 'app-products-deleted',
  standalone: true,
  imports: [
    RouterLink,
    NzTableModule, NzButtonModule, NzBreadCrumbModule, NzPopconfirmModule,
    NzTagModule, NzIconModule, NzInputModule, NzDividerModule, NzAlertModule,
  ],
  template: `
    <div class="products-page">
      <nz-breadcrumb>
        <nz-breadcrumb-item><a routerLink="/productos">Productos</a></nz-breadcrumb-item>
        <nz-breadcrumb-item>Eliminados</nz-breadcrumb-item>
      </nz-breadcrumb>

      <div style="display:flex;align-items:center;justify-content:space-between;margin:16px 0">
        <h2 style="margin:0">Productos eliminados</h2>
        <div style="display:flex;gap:8px;align-items:center">
          <nz-input-group [nzSuffix]="searchIcon" style="width:260px">
            <input nz-input #searchInput placeholder="Buscar por nombre o SKU…"
              (input)="onSearch(searchInput.value)" />
          </nz-input-group>
          <ng-template #searchIcon><span nz-icon nzType="search"></span></ng-template>
          <a nz-button routerLink="/productos">
            <span nz-icon nzType="arrow-left"></span> Volver
          </a>
        </div>
      </div>

      <nz-table #table
        [nzData]="items()"
        [nzTotal]="total()"
        [nzPageSize]="pageSize()"
        [nzPageIndex]="pageIndex()"
        [nzLoading]="isLoading()"
        nzShowSizeChanger
        [nzPageSizeOptions]="[10, 20, 50]"
        nzFrontPagination="false"
        (nzPageIndexChange)="onPageChange($event)"
        (nzPageSizeChange)="onPageSizeChange($event)">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          @for (row of table.data; track row.product_id) {
            <tr>
              <td><code>{{ row.sku }}</code></td>
              <td>{{ row.name }}</td>
              <td>{{ row.category?.name ?? '—' }}</td>
              <td>
                <button nz-button nzType="link"
                  nz-popconfirm
                  nzPopconfirmTitle="¿Restaurar este producto?"
                  nzPopconfirmPlacement="left"
                  (nzOnConfirm)="restore(row)">
                  Restaurar
                </button>
                <nz-divider nzType="vertical" />
                <button nz-button nzType="link" nzDanger
                  nz-popconfirm
                  nzPopconfirmTitle="¿Eliminar definitivamente? Esta acción no se puede deshacer."
                  nzPopconfirmPlacement="left"
                  (nzOnConfirm)="permanentDelete(row)">
                  Eliminar definitivamente
                </button>
              </td>
            </tr>
          }
        </tbody>
      </nz-table>
    </div>
  `,
})
export class ProductsDeletedComponent implements OnInit {
  private readonly api = inject(ProductsApiService);
  private readonly message = inject(NzMessageService);

  readonly items = signal<Product[]>([]);
  readonly total = signal(0);
  readonly isLoading = signal(false);
  readonly pageIndex = signal(1);
  readonly pageSize = signal(20);
  private _query = '';

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.isLoading.set(true);
    this.api.getDeleted({ page: this.pageIndex(), limit: this.pageSize(), query: this._query || undefined }).subscribe({
      next: (res: PaginatedResult<Product>) => {
        this.items.set(res.data);
        this.total.set(res.total);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onSearch(value: string): void {
    this._query = value;
    this.pageIndex.set(1);
    this.load();
  }

  onPageChange(page: number): void {
    this.pageIndex.set(page);
    this.load();
  }

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageIndex.set(1);
    this.load();
  }

  restore(product: Product): void {
    this.api.restore(product.product_id).subscribe({
      next: () => {
        this.items.update(list => list.filter(p => p.product_id !== product.product_id));
        this.total.update(t => t - 1);
        this.message.success(`"${product.name}" restaurado correctamente`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.message.error(err?.error?.message ?? 'No se pudo restaurar el producto');
      },
    });
  }

  permanentDelete(product: Product): void {
    this.api.permanentDelete(product.product_id).subscribe({
      next: () => {
        this.items.update(list => list.filter(p => p.product_id !== product.product_id));
        this.total.update(t => t - 1);
        this.message.success(`"${product.name}" eliminado definitivamente`);
      },
      error: (err: { error?: { message?: string } }) => {
        this.message.error(err?.error?.message ?? 'No se pudo eliminar el producto');
      },
    });
  }
}
