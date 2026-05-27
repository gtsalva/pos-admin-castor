import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products-shell/products-shell.component').then(m => m.ProductsShellComponent),
  },
  {
    path: 'eliminados',
    loadComponent: () =>
      import('./products-deleted/products-deleted.component').then(m => m.ProductsDeletedComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: ':id/editar',
    loadComponent: () =>
      import('./product-form/product-form.component').then(m => m.ProductFormComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./product-detail/product-detail.component').then(m => m.ProductDetailComponent),
  },
];
