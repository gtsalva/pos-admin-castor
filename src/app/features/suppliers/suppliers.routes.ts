import { Routes } from '@angular/router';

export const suppliersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./suppliers-list/suppliers-list.component').then(m => m.SuppliersListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./suppliers-form/suppliers-form.component').then(m => m.SuppliersFormComponent),
  },
  {
    path: ':supplierId/editar',
    loadComponent: () =>
      import('./suppliers-form/suppliers-form.component').then(m => m.SuppliersFormComponent),
  },
  {
    path: ':supplierId',
    loadComponent: () =>
      import('./suppliers-detail/suppliers-detail.component').then(m => m.SuppliersDetailComponent),
  },
];
