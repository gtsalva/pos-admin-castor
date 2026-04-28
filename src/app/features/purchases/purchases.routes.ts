import { Routes } from '@angular/router';
import { PurchasesStateService } from './services/purchases-state.service';

export const purchaseRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./purchases-list/purchases-list.component').then(m => m.PurchasesListComponent),
    providers: [PurchasesStateService],
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./purchases-new/purchases-new.component').then(m => m.PurchasesNewComponent),
  },
  {
    path: ':purchaseId',
    loadComponent: () =>
      import('./purchases-detail/purchases-detail.component').then(m => m.PurchasesDetailComponent),
  },
  {
    path: ':purchaseId/recibir',
    loadComponent: () =>
      import('./purchases-receive/purchases-receive.component').then(m => m.PurchasesReceiveComponent),
  },
];
