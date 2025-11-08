import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const LETTER_OF_CREDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./letter-of-credit-list.component').then(m => m.LetterOfCreditListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'create',
    loadComponent: () => import('./create/letter-of-credit-create.component').then(m => m.LetterOfCreditCreateComponent),
    canActivate: [authGuard]
  }
];
