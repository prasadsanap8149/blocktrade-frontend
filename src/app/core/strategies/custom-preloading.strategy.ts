import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Don't preload if explicitly disabled
    if (route.data && route.data['preload'] === false) {
      return of(null);
    }

    // Preload immediately if marked as high priority
    if (route.data && route.data['preload'] === true) {
      console.log(`Preloading route: ${route.path}`);
      return load();
    }

    // Preload after a delay for normal routes
    if (route.data && route.data['preload'] === 'delayed') {
      console.log(`Delayed preloading route: ${route.path}`);
      return timer(2000).pipe(
        switchMap(() => load())
      );
    }

    // Preload on network idle for other routes
    if (this.isNetworkIdle()) {
      console.log(`Network idle preloading route: ${route.path}`);
      return timer(1000).pipe(
        switchMap(() => load())
      );
    }

    // Don't preload by default
    return of(null);
  }

  private isNetworkIdle(): boolean {
    // Check if network is idle (simple implementation)
    // In a real app, you might use navigator.connection API
    return (navigator as any).connection ? 
           (navigator as any).connection.effectiveType !== 'slow-2g' : 
           true;
  }
}
