import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Redirect authenticated users to dashboard
  const isAuthenticated = localStorage.getItem('auth_token') !== null;
  
  if (isAuthenticated) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
