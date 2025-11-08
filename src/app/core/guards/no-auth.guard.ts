import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Redirect authenticated users to dashboard
  const isAuthenticated = authService.isAuthenticated();
  
  if (isAuthenticated) {
    router.navigate(['/dashboard']);
    return false;
  }
  
  return true;
};
