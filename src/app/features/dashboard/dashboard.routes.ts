import { Routes } from '@angular/router';

export const DOCUMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./dashboard.component').then(m => m.DashboardComponent) }
];
