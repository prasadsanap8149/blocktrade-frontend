/**
 * Authentication Service
 * Handles user authentication, authorization, and session management
 */

import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';

import { ApiService } from './api.service';
import { NotificationService } from './notification.service';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint.constants';
import { APP_CONFIG } from '../../shared/constants/app-config.constants';
import { MESSAGES } from '../../shared/constants/messages.constants';
import { 
  User, 
  UserLogin, 
  UserRegistration, 
  UserProfile, 
  ChangePassword, 
  ForgotPassword, 
  ResetPassword, 
  AuthResponse, 
  AuthTokens,
  Permission
} from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);
  private readonly notificationService = inject(NotificationService);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userPermissionsSubject = new BehaviorSubject<Permission[]>([]);
  private sessionTimerSubject = new BehaviorSubject<number>(0);

  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public userPermissions$ = this.userPermissionsSubject.asObservable();
  public sessionTimer$ = this.sessionTimerSubject.asObservable();

  private sessionTimer: any;
  private sessionWarningTimer: any;

  constructor() {
    this.initializeFromStorage();
    this.startSessionMonitoring();
  }

  // Private helper method for safe message access
  private getMessage(path: string): string {
    const parts = path.split('.');
    let current: any = MESSAGES;
    for (const part of parts) {
      current = current?.[part];
    }
    return current || 'Operation completed';
  }

  /**
   * User Login
   */
  login(credentials: UserLogin): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials).pipe(
      map(response => response.data),
      tap(authResponse => {
        if (authResponse.success && authResponse.data) {
          this.handleSuccessfulAuth(authResponse.data);
          this.notificationService.success(this.getMessage('SUCCESS.LOGIN'));
        }
      }),
      catchError(error => {
        // Don't show notification here, let the component handle it
        return throwError(error);
      })
    );
  }

  /**
   * User Registration
   */
  register(userData: UserRegistration): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, userData).pipe(
      map(response => response.data),
      tap(authResponse => {
        if (authResponse.success && authResponse.data) {
          this.handleSuccessfulAuth(authResponse.data);
          // Don't show notification here, let the component handle it
        }
      }),
      catchError(error => {
        // Don't show notification here, let the component handle it
        return throwError(error);
      })
    );
  }

  /**
   * User Logout
   */
  logout(): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.LOGOUT).pipe(
      tap(() => {
        this.handleLogout();
        this.notificationService.success(this.getMessage('SUCCESS.LOGOUT'));
      }),
      catchError(error => {
        // Even if logout fails on server, clear local session
        this.handleLogout();
        return throwError(error);
      })
    );
  }

  /**
   * Get Current User Profile
   */
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>(API_ENDPOINTS.AUTH.ME).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data);
        }
      }),
      map(response => response.data),
      catchError(error => {
        if (error.status === 401) {
          this.handleUnauthorized();
        }
        return throwError(error);
      })
    );
  }

  /**
   * Update User Profile
   */
  updateProfile(profileData: UserProfile): Observable<User> {
    return this.apiService.put<User>(API_ENDPOINTS.AUTH.PROFILE, profileData).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setCurrentUser(response.data);
          this.notificationService.success(this.getMessage("SUCCESS.PROFILE_UPDATED"));
        }
      }),
      map(response => response.data),
      catchError(error => {
        this.notificationService.error(error.message || this.getMessage("ERROR.GENERIC"));
        return throwError(error);
      })
    );
  }

  /**
   * Change Password
   */
  changePassword(passwordData: ChangePassword): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData).pipe(
      tap(response => {
        if (response.success) {
          this.notificationService.success(this.getMessage("SUCCESS.PASSWORD_CHANGED"));
        }
      }),
      catchError(error => {
        this.notificationService.error(error.message || this.getMessage("ERROR.GENERIC"));
        return throwError(error);
      })
    );
  }

  /**
   * Forgot Password
   */
  forgotPassword(data: ForgotPassword): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data).pipe(
      tap(response => {
        if (response.success) {
          this.notificationService.success(this.getMessage("SUCCESS.PASSWORD_RESET_SENT"));
        }
      }),
      catchError(error => {
        this.notificationService.error(error.message || this.getMessage("ERROR.GENERIC"));
        return throwError(error);
      })
    );
  }

  /**
   * Reset Password
   */
  resetPassword(data: ResetPassword): Observable<any> {
    return this.apiService.post(API_ENDPOINTS.AUTH.RESET_PASSWORD, data).pipe(
      tap(response => {
        if (response.success) {
          this.notificationService.success(this.getMessage("SUCCESS.PASSWORD_RESET"));
        }
      }),
      catchError(error => {
        this.notificationService.error(error.message || this.getMessage("ERROR.GENERIC"));
        return throwError(error);
      })
    );
  }

  /**
   * Refresh Access Token
   */
  refreshToken(): Observable<AuthTokens> {
    return this.apiService.refreshToken().pipe(
      tap(tokens => {
        this.updateTokens(tokens);
        this.resetSessionTimer();
      }),
      catchError(error => {
        this.handleUnauthorized();
        return throwError(error);
      })
    );
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: Permission): boolean {
    const permissions = this.userPermissionsSubject.value;
    return permissions.includes(permission);
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: Permission[]): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    return permissions.some(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has all specified permissions
   */
  hasAllPermissions(permissions: Permission[]): boolean {
    const userPermissions = this.userPermissionsSubject.value;
    return permissions.every(permission => userPermissions.includes(permission));
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.role === role;
  }

  /**
   * Check if user belongs to specific organization type
   */
  hasOrganizationType(type: string): boolean {
    const currentUser = this.currentUserSubject.value;
    return currentUser?.organizationType === type;
  }

  /**
   * Get current user
   */
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value && this.apiService.isAuthenticated();
  }

  /**
   * Force logout due to inactivity or security concerns
   */
  forceLogout(reason: string = 'Session expired'): void {
    this.clearSession();
    this.notificationService.warning(reason);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Extend session timer
   */
  extendSession(): void {
    this.resetSessionTimer();
  }

  /**
   * Get session remaining time in seconds
   */
  getSessionRemainingTime(): number {
    return this.sessionTimerSubject.value;
  }

  // Private methods

  private handleSuccessfulAuth(authData: { user: User; tokens: AuthTokens }): void {
    this.setCurrentUser(authData.user);
    this.updateTokens(authData.tokens);
    this.setAuthenticated(true);
    this.resetSessionTimer();
    this.saveUserToStorage(authData.user);
  }

  private handleLogout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private handleUnauthorized(): void {
    this.clearSession();
    this.notificationService.error(this.getMessage("ERROR.UNAUTHORIZED"));
    this.router.navigate(['/auth/login']);
  }

  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    this.userPermissionsSubject.next(user.permissions);
    this.saveUserToStorage(user);
  }

  private setAuthenticated(authenticated: boolean): void {
    this.isAuthenticatedSubject.next(authenticated);
  }

  private updateTokens(tokens: AuthTokens): void {
    this.apiService.setToken(tokens.accessToken);
    this.apiService.setRefreshToken(tokens.refreshToken);
  }

  private clearSession(): void {
    this.currentUserSubject.next(null);
    this.userPermissionsSubject.next([]);
    this.setAuthenticated(false);
    this.apiService.clearTokens();
    this.clearSessionTimers();
    this.clearStorageData();
  }

  private initializeFromStorage(): void {
    const userData = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    if (userData) {
      try {
        const user: User = JSON.parse(userData);
        this.setCurrentUser(user);
        this.setAuthenticated(this.apiService.isAuthenticated());
        
        if (this.isAuthenticated()) {
          this.resetSessionTimer();
        }
      } catch (error) {
        this.clearStorageData();
      }
    }
  }

  private saveUserToStorage(user: User): void {
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.LAST_LOGIN, new Date().toISOString());
  }

  private clearStorageData(): void {
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.LAST_LOGIN);
  }

  private startSessionMonitoring(): void {
    // Check authentication status periodically
    timer(0, 60000).subscribe(() => {
      if (this.isAuthenticatedSubject.value && !this.apiService.isAuthenticated()) {
        this.handleUnauthorized();
      }
    });
  }

  private resetSessionTimer(): void {
    this.clearSessionTimers();
    
    const sessionDuration = APP_CONFIG.SECURITY.SESSION_TIMEOUT;
    const warningTime = 5 * 60 * 1000; // 5 minutes before expiry
    
    // Set warning timer
    this.sessionWarningTimer = setTimeout(() => {
      this.notificationService.warning(this.getMessage("WARNING.SESSION_TIMEOUT"));
    }, sessionDuration - warningTime);
    
    // Set logout timer
    this.sessionTimer = setTimeout(() => {
      this.forceLogout(this.getMessage("ERROR.TOKEN_EXPIRED"));
    }, sessionDuration);
    
    // Update countdown timer
    const startTime = Date.now();
    const countdownTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.floor((sessionDuration - elapsed) / 1000));
      this.sessionTimerSubject.next(remaining);
      
      if (remaining <= 0) {
        clearInterval(countdownTimer);
      }
    }, 1000);
  }

  private clearSessionTimers(): void {
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    if (this.sessionWarningTimer) {
      clearTimeout(this.sessionWarningTimer);
      this.sessionWarningTimer = null;
    }
  }
}
