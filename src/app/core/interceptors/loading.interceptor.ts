import { HttpInterceptorFn } from '@angular/common/http';
import { finalize } from 'rxjs/operators';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  // Set loading state
  console.log('Request started:', req.url);
  
  return next(req).pipe(
    finalize(() => {
      // Clear loading state
      console.log('Request completed:', req.url);
    })
  );
};
