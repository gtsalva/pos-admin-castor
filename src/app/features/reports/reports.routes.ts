import { Routes } from '@angular/router';
import { ReportsShellComponent } from './reports-shell/reports-shell.component';

export const reportsRoutes: Routes = [
  {
    path: '',
    component: ReportsShellComponent,
    children: [
      { path: '', redirectTo: 'ingresos', pathMatch: 'full' },
      {
        path: 'vendedores',
        loadComponent: () =>
          import('./top-sellers/top-sellers.component').then((m) => m.TopSellersComponent),
      },
      {
        path: 'productos',
        loadComponent: () =>
          import('./top-products/top-products.component').then((m) => m.TopProductsComponent),
      },
      {
        path: 'margenes',
        loadComponent: () =>
          import('./product-margins/product-margins.component').then((m) => m.ProductMarginsComponent),
      },
      {
        path: 'ingresos',
        loadComponent: () =>
          import('./revenue/revenue.component').then((m) => m.RevenueComponent),
      },
    ],
  },
];
