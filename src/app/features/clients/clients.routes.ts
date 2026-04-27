import { Routes } from '@angular/router';

export const clientsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./clients-shell/clients-shell.component').then(m => m.ClientsShellComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./components/client-form/client-form.component').then(m => m.ClientFormComponent),
  },
  {
    path: ':client_id/editar',
    loadComponent: () =>
      import('./components/client-form/client-form.component').then(m => m.ClientFormComponent),
  },
];
