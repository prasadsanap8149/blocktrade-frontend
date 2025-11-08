/**
 * Dashboard Service
 * Handles API communications and data management for dashboard
 */

import { Injectable, inject } from '@angular/core';
import { Observable, BehaviorSubject, combineLatest, interval } from 'rxjs';
import { map, catchError, startWith, switchMap, tap } from 'rxjs/operators';

import { ApiService } from '../../core/services/api.service';
import { SecureStorageService } from '../../shared/services/secure-storage.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint.constants';

export interface DashboardStats {
  totalLettersOfCredit: number;
  pendingApprovals: number;
  completedTransactions: number;
  totalVolume: number;
  activeDocuments: number;
  pendingPayments: number;
  monthlyGrowth?: number;
  lastUpdated?: string;
}

export interface RecentActivity {
  id: string;
  type: 'LC_CREATED' | 'LC_APPROVED' | 'LC_REJECTED' | 'DOCUMENT_UPLOADED' | 'PAYMENT_PROCESSED' | 'COMPLIANCE_CHECK';
  title: string;
  description: string;
  timestamp: Date;
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'WARNING';
  amount?: number;
  currency?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  metadata?: { [key: string]: any };
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionText?: string;
  expiresAt?: Date;
}

export interface DashboardAlert {
  id: string;
  title: string;
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'COMPLIANCE' | 'SECURITY' | 'SYSTEM' | 'BUSINESS';
  timestamp: Date;
  acknowledged: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface ComplianceStatus {
  kycStatus: 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'REJECTED';
  amlStatus: 'CLEARED' | 'PENDING' | 'FLAGGED';
  documentVerification: 'COMPLETED' | 'PENDING' | 'EXPIRED';
  overallScore: number;
  lastCheck: Date;
  nextReview: Date;
}

export interface SystemHealth {
  blockchainStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  apiStatus: 'OPERATIONAL' | 'DEGRADED' | 'DOWN';
  databaseStatus: 'CONNECTED' | 'SLOW' | 'DISCONNECTED';
  securityStatus: 'SECURE' | 'WARNING' | 'BREACH';
  lastCheck: Date;
  uptime: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private readonly apiService = inject(ApiService);
  private readonly secureStorage = inject(SecureStorageService);
  private readonly notificationService = inject(NotificationService);
  private readonly authService = inject(AuthService);

  // Private subjects for state management
  private readonly dashboardStatsSubject = new BehaviorSubject<DashboardStats>({
    totalLettersOfCredit: 0,
    pendingApprovals: 0,
    completedTransactions: 0,
    totalVolume: 0,
    activeDocuments: 0,
    pendingPayments: 0
  });

  private readonly recentActivitiesSubject = new BehaviorSubject<RecentActivity[]>([]);
  private readonly notificationsSubject = new BehaviorSubject<SystemNotification[]>([]);
  private readonly alertsSubject = new BehaviorSubject<DashboardAlert[]>([]);
  private readonly complianceStatusSubject = new BehaviorSubject<ComplianceStatus | null>(null);
  private readonly systemHealthSubject = new BehaviorSubject<SystemHealth | null>(null);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);

  // Public observables
  readonly dashboardStats$ = this.dashboardStatsSubject.asObservable();
  readonly recentActivities$ = this.recentActivitiesSubject.asObservable();
  readonly notifications$ = this.notificationsSubject.asObservable();
  readonly alerts$ = this.alertsSubject.asObservable();
  readonly complianceStatus$ = this.complianceStatusSubject.asObservable();
  readonly systemHealth$ = this.systemHealthSubject.asObservable();
  readonly isLoading$ = this.loadingSubject.asObservable();

  // Computed observables
  readonly unreadNotificationsCount$ = this.notifications$.pipe(
    map(notifications => notifications.filter(n => !n.read).length)
  );

  readonly criticalAlertsCount$ = this.alerts$.pipe(
    map(alerts => alerts.filter(a => a.severity === 'CRITICAL' && !a.acknowledged).length)
  );

  readonly dashboardSummary$ = combineLatest([
    this.dashboardStats$,
    this.unreadNotificationsCount$,
    this.criticalAlertsCount$
  ]).pipe(
    map(([stats, unreadCount, criticalCount]) => ({
      stats,
      unreadNotifications: unreadCount,
      criticalAlerts: criticalCount,
      lastUpdated: new Date()
    }))
  );

  constructor() {
    // Load cached data first for better UX (don't auto-load fresh data)
    this.loadCachedData().catch(error => console.warn('Cache loading failed:', error));
    
    // Setup auto-refresh but don't start loading immediately
    // Component will control the initial load
    this.setupAutoRefresh();
  }

  /**
   * Load all dashboard data
   */
  loadAllDashboardData(): Observable<any> {
    console.log('DashboardService: Loading all dashboard data...');
    this.loadingSubject.next(true);

    return combineLatest([
      this.loadDashboardStats().pipe(catchError(err => {
        console.error('Stats loading failed:', err);
        return this.dashboardStats$;
      })),
      this.loadRecentActivities().pipe(catchError(err => {
        console.error('Activities loading failed:', err);
        return this.recentActivities$;
      })),
      this.loadNotifications().pipe(catchError(err => {
        console.error('Notifications loading failed:', err);
        return this.notifications$;
      })),
      this.loadAlerts().pipe(catchError(err => {
        console.error('Alerts loading failed:', err);
        return this.alerts$;
      })),
      this.loadComplianceStatus().pipe(catchError(err => {
        console.error('Compliance loading failed:', err);
        return this.complianceStatus$;
      })),
      this.loadSystemHealth().pipe(catchError(err => {
        console.error('System health loading failed:', err);
        return this.systemHealth$;
      }))
    ]).pipe(
      tap(() => {
        console.log('DashboardService: All data loaded successfully');
        this.loadingSubject.next(false);
      }),
      catchError(error => {
        console.error('Dashboard data loading error:', error);
        this.loadingSubject.next(false);
        // Don't throw error, just complete
        return [];
      })
    );
  }

  /**
   * Load dashboard statistics
   */
  loadDashboardStats(): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS).pipe(
      tap(response => {
        if (response.success && response.data) {
          const stats = { ...response.data, lastUpdated: new Date().toISOString() };
          this.dashboardStatsSubject.next(stats);
          this.cacheData('dashboard_stats', stats).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load dashboard stats:', error);
        return this.dashboardStats$;
      })
    );
  }

  /**
   * Load recent activities
   */
  loadRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    return this.apiService.get<RecentActivity[]>(API_ENDPOINTS.DASHBOARD.ACTIVITIES, { limit }).pipe(
      tap(response => {
        if (response.success && response.data) {
          const activities = response.data.map(activity => ({
            ...activity,
            timestamp: new Date(activity.timestamp)
          }));
          this.recentActivitiesSubject.next(activities);
          this.cacheData('recent_activities', activities).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data || []),
      catchError(error => {
        console.error('Failed to load recent activities:', error);
        return this.recentActivities$;
      })
    );
  }

  /**
   * Load system notifications
   */
  loadNotifications(): Observable<SystemNotification[]> {
    return this.apiService.get<SystemNotification[]>(API_ENDPOINTS.DASHBOARD.NOTIFICATIONS).pipe(
      tap(response => {
        if (response.success && response.data) {
          const notifications = response.data.map(notification => ({
            ...notification,
            timestamp: new Date(notification.timestamp),
            expiresAt: notification.expiresAt ? new Date(notification.expiresAt) : undefined
          }));
          this.notificationsSubject.next(notifications);
          this.cacheData('notifications', notifications).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data || []),
      catchError(error => {
        console.error('Failed to load notifications:', error);
        return this.notifications$;
      })
    );
  }

  /**
   * Load dashboard alerts
   */
  loadAlerts(): Observable<DashboardAlert[]> {
    return this.apiService.get<DashboardAlert[]>(API_ENDPOINTS.DASHBOARD.ALERTS).pipe(
      tap(response => {
        if (response.success && response.data) {
          const alerts = response.data.map(alert => ({
            ...alert,
            timestamp: new Date(alert.timestamp)
          }));
          this.alertsSubject.next(alerts);
          this.cacheData('alerts', alerts).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data || []),
      catchError(error => {
        console.error('Failed to load alerts:', error);
        return this.alerts$;
      })
    );
  }

  /**
   * Load compliance status
   */
  loadComplianceStatus(): Observable<ComplianceStatus | null> {
    return this.apiService.get<ComplianceStatus>(API_ENDPOINTS.DASHBOARD.COMPLIANCE).pipe(
      tap(response => {
        if (response.success && response.data) {
          const compliance = {
            ...response.data,
            lastCheck: new Date(response.data.lastCheck),
            nextReview: new Date(response.data.nextReview)
          };
          this.complianceStatusSubject.next(compliance);
          this.cacheData('compliance_status', compliance).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load compliance status:', error);
        return this.complianceStatus$;
      })
    );
  }

  /**
   * Load system health
   */
  loadSystemHealth(): Observable<SystemHealth | null> {
    return this.apiService.get<SystemHealth>(API_ENDPOINTS.DASHBOARD.SYSTEM_HEALTH).pipe(
      tap(response => {
        if (response.success && response.data) {
          const health = {
            ...response.data,
            lastCheck: new Date(response.data.lastCheck)
          };
          this.systemHealthSubject.next(health);
          this.cacheData('system_health', health).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load system health:', error);
        return this.systemHealth$;
      })
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<boolean> {
    return this.apiService.put<boolean>(`${API_ENDPOINTS.DASHBOARD.NOTIFICATIONS}/${notificationId}/read`).pipe(
      tap(response => {
        if (response.success) {
          const notifications = this.notificationsSubject.value.map(n =>
            n.id === notificationId ? { ...n, read: true } : n
          );
          this.notificationsSubject.next(notifications);
          this.cacheData('notifications', notifications).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.success),
      catchError(error => {
        console.error('Failed to mark notification as read:', error);
        this.notificationService.error('Failed to update notification');
        return [false];
      })
    );
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string): Observable<boolean> {
    return this.apiService.put<boolean>(`${API_ENDPOINTS.DASHBOARD.ALERTS}/${alertId}/acknowledge`).pipe(
      tap(response => {
        if (response.success) {
          const alerts = this.alertsSubject.value.map(a =>
            a.id === alertId ? { ...a, acknowledged: true } : a
          );
          this.alertsSubject.next(alerts);
          this.cacheData('alerts', alerts).catch(error => console.warn('Caching failed:', error));
        }
      }),
      map(response => response.success),
      catchError(error => {
        console.error('Failed to acknowledge alert:', error);
        this.notificationService.error('Failed to acknowledge alert');
        return [false];
      })
    );
  }

  /**
   * Get filtered activities by type
   */
  getActivitiesByType(type: RecentActivity['type']): Observable<RecentActivity[]> {
    return this.recentActivities$.pipe(
      map(activities => activities.filter(activity => activity.type === type))
    );
  }

  /**
   * Get activities by date range
   */
  getActivitiesByDateRange(startDate: Date, endDate: Date): Observable<RecentActivity[]> {
    return this.recentActivities$.pipe(
      map(activities => activities.filter(activity => 
        activity.timestamp >= startDate && activity.timestamp <= endDate
      ))
    );
  }

  /**
   * Cache data securely
   */
  private async cacheData(key: string, data: any): Promise<void> {
    try {
      await this.secureStorage.setItem(`dashboard_${key}`, data, { 
        encrypt: true, 
        expiry: 300000, // 5 minutes
        compress: true 
      });
    } catch (error) {
      console.warn('Failed to cache dashboard data:', error);
    }
  }

  /**
   * Load cached data
   */
  private async loadCachedData(): Promise<void> {
    try {
      const stats = await this.secureStorage.getItem<DashboardStats>('dashboard_dashboard_stats');
      if (stats) {
        this.dashboardStatsSubject.next(stats);
      }

      const activities = await this.secureStorage.getItem<RecentActivity[]>('dashboard_recent_activities');
      if (activities) {
        this.recentActivitiesSubject.next(activities);
      }

      const notifications = await this.secureStorage.getItem<SystemNotification[]>('dashboard_notifications');
      if (notifications) {
        this.notificationsSubject.next(notifications);
      }

      const alerts = await this.secureStorage.getItem<DashboardAlert[]>('dashboard_alerts');
      if (alerts) {
        this.alertsSubject.next(alerts);
      }

      const compliance = await this.secureStorage.getItem<ComplianceStatus>('dashboard_compliance_status');
      if (compliance) {
        this.complianceStatusSubject.next(compliance);
      }

      const health = await this.secureStorage.getItem<SystemHealth>('dashboard_system_health');
      if (health) {
        this.systemHealthSubject.next(health);
      }
    } catch (error) {
      console.warn('Failed to load cached dashboard data:', error);
    }
  }

  /**
   * Setup auto-refresh for dashboard data
   */
  private setupAutoRefresh(): void {
    // Refresh every 5 minutes when user is active
    interval(300000).pipe(
      switchMap(() => this.authService.currentUser$),
      switchMap(user => user ? this.loadAllDashboardData() : [])
    ).subscribe();

    // Refresh stats more frequently (every minute)
    interval(60000).pipe(
      switchMap(() => this.authService.currentUser$),
      switchMap(user => user ? this.loadDashboardStats() : [])
    ).subscribe();
  }

  /**
   * Refresh all dashboard data manually
   */
  refreshDashboard(): Observable<any> {
    this.clearCache().catch(error => console.warn('Cache clearing failed:', error));
    return this.loadAllDashboardData();
  }

  /**
   * Clear cached data
   */
  private async clearCache(): Promise<void> {
    const keys = [
      'dashboard_dashboard_stats',
      'dashboard_recent_activities', 
      'dashboard_notifications',
      'dashboard_alerts',
      'dashboard_compliance_status',
      'dashboard_system_health'
    ];

    for (const key of keys) {
      try {
        await this.secureStorage.removeItem(key);
      } catch (error) {
        console.warn(`Failed to clear cache for ${key}:`, error);
      }
    }
  }

  /**
   * Get dashboard statistics for specific time range
   */
  getStatsForTimeRange(range: '7d' | '30d' | '90d' | '1y'): Observable<DashboardStats> {
    return this.apiService.get<DashboardStats>(API_ENDPOINTS.DASHBOARD.STATS, { range }).pipe(
      map(response => response.data),
      catchError(error => {
        console.error('Failed to load stats for time range:', error);
        return this.dashboardStats$;
      })
    );
  }

  /**
   * Export dashboard data
   */
  exportDashboardData(format: 'json' | 'csv' = 'json'): Observable<Blob> {
    return this.apiService.download(`${API_ENDPOINTS.DASHBOARD.EXPORT}?format=${format}`);
  }

  /**
   * Get organization-specific quick actions
   */
  getQuickActionsForUser(user: User): Observable<any[]> {
    return this.apiService.get<any[]>(API_ENDPOINTS.DASHBOARD.QUICK_ACTIONS, {
      organizationType: user.organizationType,
      role: user.role
    }).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Failed to load quick actions:', error);
        return [[]];
      })
    );
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    this.dashboardStatsSubject.complete();
    this.recentActivitiesSubject.complete();
    this.notificationsSubject.complete();
    this.alertsSubject.complete();
    this.complianceStatusSubject.complete();
    this.systemHealthSubject.complete();
    this.loadingSubject.complete();
  }
}
