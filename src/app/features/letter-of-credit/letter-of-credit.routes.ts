import { Routes } from '@angular/router';

export const LETTER_OF_CREDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./letter-of-credit-list.component').then(m => m.LetterOfCreditListComponent)
  }
];
