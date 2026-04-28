import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminRoleGuard } from './core/guards/admin-role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: '',
    canActivate: [authGuard, adminRoleGuard],
    loadComponent: () =>
      import('./layout/admin-shell/admin-shell.component').then(m => m.AdminShellComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('./features/products/products.routes').then(m => m.productRoutes),
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('./features/sales/sales.routes').then(m => m.salesRoutes),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(m => m.inventoryRoutes),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('./features/clients/clients.routes').then(m => m.clientsRoutes),
      },
      {
        path: 'proveedores',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then(m => m.suppliersRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
