/**
 * Core API Service
 * Centralized HTTP client for all API communications
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of, timer } from 'rxjs';
import { catchError, retryWhen, mergeMap, tap, map, switchMap, take, delay } from 'rxjs/operators';


import { AuthTokens, User } from '../models/user.model';
import { API_CONFIG, API_ENDPOINTS, CONTENT_TYPES } from '@app/shared/constants/api-endpoint.constants';
import { APP_CONFIG } from '@app/shared/constants/app-config.constants';
import { MESSAGES } from '@app/shared/constants/messages.constants';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
  timestamp?: string;
  requestId?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface QueryParams {
  [key: string]: string | number | boolean | string[] | number[] | undefined;
}

export interface ApiRequestOptions {
  headers?: Record<string, string>;
  reportProgress?: boolean;
  withCredentials?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = API_CONFIG.BASE_URL;
  private readonly timeout = API_CONFIG.TIMEOUT;
  
  private tokenSubject = new BehaviorSubject<string | null>(null);
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;

  constructor(private http: HttpClient) {
    this.loadTokensFromStorage();
  }

  /**
   * Smart retry logic that only retries on network errors and 500 errors
   */
  private smartRetry<T>() {
    return retryWhen<T>(errors =>
      errors.pipe(
        mergeMap((error, index) => {
          const shouldRetry = (
            error.status === 0 || // Network error
            error.status >= 500 || // Server errors
            error.name === 'TimeoutError'
          ) && index < APP_CONFIG.API.RETRY_ATTEMPTS;

          if (shouldRetry) {
            // Exponential backoff: wait 1s, 2s, 4s...
            const delayTime = Math.pow(2, index) * 1000;
            console.log(`Retrying API call (attempt ${index + 1}/${APP_CONFIG.API.RETRY_ATTEMPTS}) after ${delayTime}ms delay`);
            return timer(delayTime);
          } else {
            return throwError(error);
          }
        }),
        take(APP_CONFIG.API.RETRY_ATTEMPTS)
      )
    );
  }

  /**
   * Generic GET request
   */
  get<T>(endpoint: string, params?: QueryParams, options?: ApiRequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const httpParams = this.buildParams(params);
    const headers = this.buildHeaders(options?.headers);

    return this.http.get<ApiResponse<T>>(url, { 
      params: httpParams, 
      headers,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      this.smartRetry<ApiResponse<T>>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic POST request
   */
  post<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.post<ApiResponse<T>>(url, body, { 
      headers,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      this.smartRetry<ApiResponse<T>>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic PUT request
   */
  put<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.put<ApiResponse<T>>(url, body, { 
      headers,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      this.smartRetry<ApiResponse<T>>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic PATCH request
   */
  patch<T>(endpoint: string, body?: any, options?: ApiRequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.patch<ApiResponse<T>>(url, body, { 
      headers,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      this.smartRetry<ApiResponse<T>>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Generic DELETE request
   */
  delete<T>(endpoint: string, options?: ApiRequestOptions): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders(options?.headers);

    return this.http.delete<ApiResponse<T>>(url, { 
      headers,
      reportProgress: options?.reportProgress,
      withCredentials: options?.withCredentials
    }).pipe(
      this.smartRetry<ApiResponse<T>>(),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * File upload request
   */
  upload<T>(endpoint: string, file: File, additionalData?: any): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    formData.append('file', file);
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const headers = this.buildHeaders({}, { skipContentType: true });

    return this.http.post<ApiResponse<T>>(url, formData, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Multiple file upload request
   */
  uploadMultiple<T>(endpoint: string, files: File[], additionalData?: any): Observable<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const formData = new FormData();
    
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
    
    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        const value = additionalData[key];
        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : value);
      });
    }

    const headers = this.buildHeaders({}, { skipContentType: true });

    return this.http.post<ApiResponse<T>>(url, formData, { headers }).pipe(
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * File download request
   */
  download(endpoint: string, filename?: string): Observable<Blob> {
    const url = this.buildUrl(endpoint);
    const headers = this.buildHeaders();

    return this.http.get(url, { 
      headers,
      responseType: 'blob',
      observe: 'response'
    }).pipe(
      map(response => {
        // Handle filename from Content-Disposition header if provided
        if (filename) {
          const blob = new Blob([response.body!], { type: response.headers.get('content-type') || 'application/octet-stream' });
          this.downloadBlob(blob, filename);
        }
        return response.body!;
      }),
      catchError(this.handleError.bind(this))
    );
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
    this.tokenSubject.next(token);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Set refresh token
   */
  setRefreshToken(refreshToken: string): void {
    this.refreshTokenSubject.next(refreshToken);
    localStorage.setItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.tokenSubject.value;
  }

  /**
   * Get current refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshTokenSubject.value;
  }

  /**
   * Clear tokens
   */
  clearTokens(): void {
    this.tokenSubject.next(null);
    this.refreshTokenSubject.next(null);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Refresh access token
   */
  refreshToken(): Observable<AuthTokens> {
    if (this.isRefreshing) {
      return new Observable(observer => {
        const checkToken = () => {
          const token = this.getToken();
          if (token && !this.isTokenExpired(token)) {
            observer.next({
              accessToken: token,
              refreshToken: this.getRefreshToken() || '',
              expiresIn: 3600
            });
            observer.complete();
          } else {
            setTimeout(checkToken, 100);
          }
        };
        checkToken();
      });
    }

    this.isRefreshing = true;
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      this.isRefreshing = false;
      return throwError('No refresh token available');
    }

    return this.http.post<ApiResponse<{ tokens: AuthTokens }>>(
      this.buildUrl(API_ENDPOINTS.AUTH.REFRESH),
      { refreshToken }
    ).pipe(
      tap(response => {
        if (response.success && response.data.tokens) {
          this.setToken(response.data.tokens.accessToken);
          this.setRefreshToken(response.data.tokens.refreshToken);
        }
        this.isRefreshing = false;
      }),
      map(response => response.data.tokens),
      catchError(error => {
        this.isRefreshing = false;
        this.clearTokens();
        return throwError(error);
      })
    );
  }

  /**
   * Make authenticated request with automatic token refresh
   */
  authenticatedRequest<T>(
    method: string,
    endpoint: string,
    body?: any,
    params?: QueryParams,
    options?: ApiRequestOptions
  ): Observable<ApiResponse<T>> {
    return new Observable(observer => {
      const makeRequest = () => {
        const requestMethod = method.toLowerCase() as keyof ApiService;
        
        let request$: Observable<ApiResponse<T>>;
        
        switch (requestMethod) {
          case 'get':
            request$ = this.get<T>(endpoint, params, options);
            break;
          case 'post':
            request$ = this.post<T>(endpoint, body, options);
            break;
          case 'put':
            request$ = this.put<T>(endpoint, body, options);
            break;
          case 'patch':
            request$ = this.patch<T>(endpoint, body, options);
            break;
          case 'delete':
            request$ = this.delete<T>(endpoint, options);
            break;
          default:
            observer.error(new Error(`Unsupported HTTP method: ${method}`));
            return;
        }

        request$.subscribe({
          next: (response) => observer.next(response),
          error: (error) => {
            if (error.status === 401 && this.getRefreshToken()) {
              // Token expired, try to refresh
              this.refreshToken().subscribe({
                next: () => makeRequest(), // Retry with new token
                error: (refreshError) => observer.error(refreshError)
              });
            } else {
              observer.error(error);
            }
          },
          complete: () => observer.complete()
        });
      };

      if (!this.isAuthenticated() && this.getRefreshToken()) {
        // Try to refresh token first
        this.refreshToken().subscribe({
          next: () => makeRequest(),
          error: (error) => observer.error(error)
        });
      } else {
        makeRequest();
      }
    });
  }

  // Private methods

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  private buildParams(params?: QueryParams): HttpParams {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key];
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(item => httpParams = httpParams.append(key, item.toString()));
          } else {
            httpParams = httpParams.append(key, value.toString());
          }
        }
      });
    }
    
    return httpParams;
  }

  private buildHeaders(customHeaders?: Record<string, string>, options?: { skipContentType?: boolean }): HttpHeaders {
    let headers = new HttpHeaders();
    
    // Add default Content-Type unless skipped (for file uploads)
    if (!options?.skipContentType) {
      headers = headers.set('Content-Type', CONTENT_TYPES.JSON);
    }
    
    // Add authorization header if token exists
    const token = this.getToken();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    
    // Add custom headers
    if (customHeaders) {
      Object.keys(customHeaders).forEach(key => {
        headers = headers.set(key, customHeaders[key]);
      });
    }
    
    return headers;
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage:string = MESSAGES.ERROR.GENERIC;
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = error.error.message || MESSAGES.ERROR.NETWORK;
    } else {
      // Server-side error
      switch (error.status) {
        case 400:
          errorMessage = error.error?.message || MESSAGES.ERROR.VALIDATION;
          break;
        case 401:
          errorMessage = MESSAGES.ERROR.UNAUTHORIZED;
          break;
        case 403:
          errorMessage = MESSAGES.ERROR.FORBIDDEN;
          break;
        case 404:
          errorMessage = MESSAGES.ERROR.NOT_FOUND;
          break;
        case 500:
          errorMessage = MESSAGES.ERROR.SERVER;
          break;
        default:
          errorMessage = error.error?.message || MESSAGES.ERROR.GENERIC;
      }
    }
    
    console.error('API Error:', {
      status: error.status,
      message: errorMessage,
      error: error.error,
      url: error.url
    });
    
    return throwError({
      status: error.status,
      message: errorMessage,
      error: error.error,
      originalError: error
    });
  }

  private loadTokensFromStorage(): void {
    const token = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);
    const refreshToken = localStorage.getItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN);
    
    if (token) this.tokenSubject.next(token);
    if (refreshToken) this.refreshTokenSubject.next(refreshToken);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
