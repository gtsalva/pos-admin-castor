import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./categories-list/categories-list.component').then(m => m.CategoriesListComponent),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./categories-form/categories-form.component').then(m => m.CategoriesFormComponent),
  },
  {
    path: ':categoryId/editar',
    loadComponent: () =>
      import('./categories-form/categories-form.component').then(m => m.CategoriesFormComponent),
  },
];
