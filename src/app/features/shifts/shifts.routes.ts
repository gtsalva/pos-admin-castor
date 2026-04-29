import { Routes } from '@angular/router';

export const shiftsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./shifts-shell/shifts-shell.component').then(m => m.ShiftsShellComponent),
  },
];
