import { Routes } from '@angular/router';

export const customOrderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./custom-orders-list/custom-orders-list.component').then(m => m.CustomOrdersListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./custom-order-detail/custom-order-detail.component').then(m => m.CustomOrderDetailComponent),
  },
];
