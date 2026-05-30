import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { InventoryStateService } from '../services/inventory-state.service';
import { InventoryItem } from '../../../shared/models/inventory.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CategoriesApiService, Category } from '../../products/services/categories-api.service';

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
    NzAvatarModule,
    NzInputModule,
    NzSelectModule,
    PageHeaderComponent,
  ],
  providers: [InventoryStateService],
  templateUrl: './inventory-list.component.html',
  styleUrl: './inventory-list.component.less',
})
export class InventoryListComponent implements OnInit, OnDestroy {
  readonly state = inject(InventoryStateService);
  private readonly router = inject(Router);
  private readonly categoriesApi = inject(CategoriesApiService);
  private readonly destroy$ = new Subject<void>();

  categories: Category[] = [];

  readonly filters = new FormGroup({
    search:      new FormControl(''),
    category_id: new FormControl<string | null>(null),
    low_stock:   new FormControl(false),
  });

  ngOnInit(): void {
    this.state.load();
    this.state.loadSummary();
    this.categoriesApi.getAll().subscribe(cats => (this.categories = cats));

    this.filters.controls.search.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$),
    ).subscribe(v => this.state.setSearch(v ?? ''));

    this.filters.controls.category_id.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(v => this.state.setCategoryFilter(v));

    this.filters.controls.low_stock.valueChanges.pipe(
      takeUntil(this.destroy$),
    ).subscribe(v => this.state.toggleLowStock(v ?? false));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  clearFilters(): void {
    this.filters.reset({ search: '', category_id: null, low_stock: false });
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
