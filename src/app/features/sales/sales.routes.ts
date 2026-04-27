import { Routes } from '@angular/router';

export const salesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./sales-list/sales-list.component').then(m => m.SalesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./sale-detail/sale-detail.component').then(m => m.SaleDetailComponent),
  },
];
