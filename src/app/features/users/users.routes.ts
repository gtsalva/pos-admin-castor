import { Routes } from '@angular/router';

export const usersRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./users-list/users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'nuevo',
    loadComponent: () =>
      import('./users-form/users-form.component').then((m) => m.UsersFormComponent),
  },
  {
    path: ':userId/editar',
    loadComponent: () =>
      import('./users-form/users-form.component').then((m) => m.UsersFormComponent),
  },
];
