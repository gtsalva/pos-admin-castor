import { Routes } from '@angular/router';

export const inventoryRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./inventory-list/inventory-list.component').then(m => m.InventoryListComponent),
  },
  {
    path: ':productId',
    loadComponent: () =>
      import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent),
  },
];
