import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/landing/landing.routes').then(m => m.landingRoutes),
    data: { preload: true }
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES),
    canActivate: [noAuthGuard],
    data: { preload: false } // Don't preload auth routes
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./features/dashboard/dashboard.routes').then(m => m.DOCUMENTS_ROUTES),
    canActivate: [authGuard],
    data: { preload: true } // Preload dashboard immediately
  },
  {
    path: 'letters-of-credit',
    loadChildren: () => import('./features/letter-of-credit/letter-of-credit.routes').then(m => m.LETTER_OF_CREDIT_ROUTES),
    canActivate: [authGuard],
    data: { preload: true } // Preload LC module - high priority
  },
  {
    path: 'supply-chain',
    loadChildren: () => import('./features/supply-chain/supply-chain.routes').then(m => m.SUPPLY_CHAIN_ROUTES),
    canActivate: [authGuard],
    data: { preload: 'delayed' } // Delayed preload for supply chain
  },
  {
    path: 'documents',
    loadChildren: () => import('./features/documents/documents.routes').then(m => m.DOCUMENTS_ROUTES),
    canActivate: [authGuard],
    data: { preload: true } // Preload documents - frequently used
  },
  {
    path: 'payments',
    loadChildren: () => import('./features/payments/payments.routes').then(m => m.PAYMENTS_ROUTES),
    canActivate: [authGuard],
    data: { preload: 'delayed' } // Delayed preload for payments
  },
  {
    path: 'compliance',
    loadChildren: () => import('./features/compliance/compliance.routes').then(m => m.COMPLIANCE_ROUTES),
    canActivate: [authGuard],
    data: { preload: 'delayed' } // Delayed preload for compliance
  },
  {
    path: 'reports',
    loadChildren: () => import('./features/reports/reports.routes').then(m => m.REPORTS_ROUTES),
    canActivate: [authGuard],
    data: { preload: 'delayed' } // Delayed preload for reports
  },
  {
    path: 'settings',
    loadChildren: () => import('./features/settings/settings.routes').then(m => m.SETTINGS_ROUTES),
    canActivate: [authGuard],
    data: { preload: false } // Don't preload settings
  },
  {
    path: '**',
    loadComponent: () => import('./shared/components/not-found/not-found.component').then(m => m.NotFoundComponent),
    data: { preload: false } // Don't preload 404 page
  }
];
