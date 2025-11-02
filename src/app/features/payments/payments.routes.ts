import { Routes } from '@angular/router';

export const PAYMENTS_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./payments.component').then(m => m.PaymentsComponent) }
];
