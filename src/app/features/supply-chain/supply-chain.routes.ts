import { Routes } from '@angular/router';

export const SUPPLY_CHAIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./supply-chain.component').then(m => m.SupplyChainComponent)
  }
];
