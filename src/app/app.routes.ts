import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminRoleGuard } from './core/guards/admin-role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'reportes', pathMatch: 'full' },
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
        path: 'compras',
        loadChildren: () =>
          import('./features/purchases/purchases.routes').then(m => m.purchaseRoutes),
      },
      {
        path: 'incentivos',
        loadChildren: () =>
          import('./features/incentives/incentives.routes').then(m => m.incentivesRoutes),
      },
      {
        path: 'reportes',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(m => m.reportsRoutes),
      },
      {
        path: 'proveedores',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then(m => m.suppliersRoutes),
      },
      {
        path: 'categorias',
        loadChildren: () =>
          import('./features/categories/categories.routes').then(m => m.categoriesRoutes),
      },
      {
        path: 'usuarios',
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.usersRoutes),
      },
      {
        path: 'cierres',
        loadChildren: () =>
          import('./features/shifts/shifts.routes').then(m => m.shiftsRoutes),
      },
      {
        path: 'auditoria',
        loadChildren: () =>
          import('./features/audit/audit.routes').then(m => m.auditRoutes),
      },
      {
        path: 'cotizaciones',
        loadChildren: () =>
          import('./features/custom-orders/custom-orders.routes').then(m => m.customOrderRoutes),
      },
    ],
  },
  { path: '**', redirectTo: 'reportes' },
];
