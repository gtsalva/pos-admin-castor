import { Routes } from '@angular/router';

export const productRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./products-shell/products-shell.component').then(m => m.ProductsShellComponent),
  },
];
