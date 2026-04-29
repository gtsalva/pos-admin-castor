import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { InventoryStateService } from '../services/inventory-state.service';
import { InventoryItem } from '../../../shared/models/inventory.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-inventory-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CurrencyPipe,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzSwitchModule,
    NzIconModule,
    NzSpaceModule,
    NzDividerModule,
    PageHeaderComponent,
  ],
  providers: [InventoryStateService],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.less',
})
export class InventoryListComponent implements OnInit {
  readonly state = inject(InventoryStateService);
  private readonly router = inject(Router);

  readonly lowStockControl = new FormControl(false);

  ngOnInit(): void {
    this.state.load();
    this.lowStockControl.valueChanges.subscribe(v => {
      this.state.toggleLowStock(v ?? false);
    });
  }

  viewDetail(item: InventoryItem): void {
    this.router.navigate(['/inventario', item.product_id]);
  }

  stockTagColor(item: InventoryItem): string {
    if (item.stock < item.min_stock) return 'error';
    if (item.stock === item.min_stock) return 'warning';
    return 'success';
  }

  stockLabel(item: InventoryItem): string {
    if (item.stock < item.min_stock) return 'Bajo mínimo';
    if (item.stock === item.min_stock) return 'En mínimo';
    return 'OK';
  }
}
