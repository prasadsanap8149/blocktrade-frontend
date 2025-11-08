import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  
  // Check authentication using AuthService which validates encrypted tokens
  const isAuthenticated = authService.isAuthenticated();
  
  console.log('Auth Guard: Checking authentication', { 
    isAuthenticated, 
    requestedUrl: state.url 
  });
  
  if (!isAuthenticated) {
    console.log('Auth Guard: Not authenticated, redirecting to landing');
    router.navigate([''], { queryParams: { returnUrl: state.url } });
    return false;
  }
  
  console.log('Auth Guard: Authenticated, allowing access');
  return true;
};
