import { Routes } from '@angular/router';

export const incentivesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./incentives-list/incentives-list.component').then(m => m.IncentivesListComponent),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./incentives-detail/incentives-detail.component').then(m => m.IncentivesDetailComponent),
  },
];
