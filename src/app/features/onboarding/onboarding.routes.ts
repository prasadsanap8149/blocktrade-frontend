import { Routes } from '@angular/router';

export const ONBOARDING_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./onboarding.component').then(m => m.OnboardingComponent),
    children: [
      {
        path: '',
        redirectTo: 'step/1',
        pathMatch: 'full'
      },
      {
        path: 'step/:stepNumber',
        loadComponent: () => import('./onboarding.component').then(m => m.OnboardingComponent)
      }
    ]
  }
];
