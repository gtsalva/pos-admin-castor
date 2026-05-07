import { Routes } from '@angular/router';

export const customOrderRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./custom-orders-list/custom-orders-list.component').then(m => m.CustomOrdersListComponent),
  },
  // Task 9: detail route will be added once CustomOrderDetailComponent is implemented
  // {
  //   path: ':id',
  //   loadComponent: () =>
  //     import('./custom-order-detail/custom-order-detail.component').then(m => m.CustomOrderDetailComponent),
  // },
];
