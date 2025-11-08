import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';

import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';
import { User, UserRole, UserJourney, JourneyStep as JourneyStepInterface } from '../../core/models/user.model';
import { MESSAGES } from '../../shared/constants/messages.constants';
import { APP_CONFIG } from '../../shared/constants/app-config.constants';
import { DashboardService } from './dashboard.service';

interface DashboardStats {
  totalLettersOfCredit: number;
  pendingApprovals: number;
  completedTransactions: number;
  totalVolume: number;
  activeDocuments: number;
  pendingPayments: number;
}

interface RecentActivity {
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

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
  color: string;
  requiredRoles: UserRole[];
  requiredJourneyStep?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatGridListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  host: {
    'class': 'app-page'
  }
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  // Signals for reactive state management
  currentUser = signal<User | null>(null);
  userJourney = signal<UserJourney | null>(null);
  dashboardStats = signal<DashboardStats>({
    totalLettersOfCredit: 0,
    pendingApprovals: 0,
    completedTransactions: 0,
    totalVolume: 0,
    activeDocuments: 0,
    pendingPayments: 0
  });
  recentActivities = signal<RecentActivity[]>([]);
  isLoading = signal(true);

  // Computed properties
  userDisplayName = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}` 
      : user.username;
  });

  userRoleDisplay = computed(() => {
    const user = this.currentUser();
    if (!user) return '';
    return this.formatRoleName(user.role);
  });

  journeyProgress = computed(() => {
    const journey = this.userJourney();
    if (!journey) return 0;
    return (journey.stepsCompleted.length / journey.totalSteps) * 100;
  });

  availableQuickActions = computed(() => {
    const user = this.currentUser();
    const journey = this.userJourney();
    if (!user) return [];

    return this.quickActions.filter(action => {
      // Check role permissions
      const hasRolePermission = action.requiredRoles.includes(user.role);

      // Check journey step requirement
      const hasJourneyPermission = !action.requiredJourneyStep || 
        (journey && journey.stepsCompleted.includes(action.requiredJourneyStep));

      return hasRolePermission && hasJourneyPermission;
    });
  });

  // Quick actions configuration
  quickActions: QuickAction[] = [
    {
      id: 'create-lc',
      title: 'Create Letter of Credit',
      description: 'Initiate a new trade finance transaction',
      icon: 'add_business',
      route: '/letter-of-credit/create',
      color: 'primary',
      requiredRoles: [
        UserRole.BANK_ADMIN, 
        UserRole.BANK_OFFICER, 
        UserRole.CORPORATE_ADMIN,
        UserRole.CORPORATE_MANAGER,
        UserRole.PLATFORM_ADMIN
      ],
      requiredJourneyStep: 5
    },
    {
      id: 'upload-documents',
      title: 'Upload Documents',
      description: 'Submit trade documents for verification',
      icon: 'cloud_upload',
      route: '/documents/upload',
      color: 'accent',
      requiredRoles: [
        UserRole.CORPORATE_USER,
        UserRole.CORPORATE_MANAGER,
        UserRole.CORPORATE_ADMIN,
        UserRole.BANK_OFFICER,
        UserRole.BANK_SPECIALIST
      ],
      requiredJourneyStep: 3
    },
    {
      id: 'review-applications',
      title: 'Review Applications',
      description: 'Approve or reject LC applications',
      icon: 'rate_review',
      route: '/letter-of-credit/review',
      color: 'warn',
      requiredRoles: [
        UserRole.BANK_ADMIN,
        UserRole.BANK_OFFICER,
        UserRole.PLATFORM_ADMIN
      ],
      requiredJourneyStep: 5
    },
    {
      id: 'process-payments',
      title: 'Process Payments',
      description: 'Handle payment transactions',
      icon: 'payment',
      route: '/payments',
      color: 'primary',
      requiredRoles: [
        UserRole.BANK_ADMIN,
        UserRole.BANK_OFFICER,
        UserRole.NBFC_ADMIN,
        UserRole.NBFC_MANAGER
      ],
      requiredJourneyStep: 5
    },
    {
      id: 'view-reports',
      title: 'View Reports',
      description: 'Access analytics and compliance reports',
      icon: 'analytics',
      route: '/reports',
      color: 'accent',
      requiredRoles: [
        UserRole.BANK_ADMIN,
        UserRole.CORPORATE_ADMIN,
        UserRole.PLATFORM_ADMIN,
        UserRole.ORGANIZATION_ADMIN
      ],
      requiredJourneyStep: 3
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      description: 'Administer user accounts and permissions',
      icon: 'group',
      route: '/admin/users',
      color: 'warn',
      requiredRoles: [
        UserRole.PLATFORM_ADMIN,
        UserRole.PLATFORM_SUPER_ADMIN,
        UserRole.ORGANIZATION_ADMIN,
        UserRole.ORGANIZATION_SUPER_ADMIN
      ],
      requiredJourneyStep: 5
    }
  ];

  // Constants for template
  readonly MESSAGES = MESSAGES;
  readonly APP_CONFIG = APP_CONFIG;

  ngOnInit(): void {
    this.initializeDashboard();
  }

  private async initializeDashboard(): Promise<void> {
    try {
      console.log('Dashboard: Initializing...');
      
      // Setup reactive subscriptions first
      this.setupDashboardSubscriptions();
      
      // Wait for authentication to be ready
      await this.waitForAuthentication();
      console.log('Dashboard: Authentication check complete');
      
      // Get current user immediately after auth check
      const currentUser = this.authService.getCurrentUserValue();
      if (currentUser) {
        console.log('Dashboard: User data available, loading dashboard', currentUser);
        this.currentUser.set(currentUser);
        await this.loadUserJourney(currentUser.id);
        
        // Load dashboard data
        this.dashboardService.loadAllDashboardData().subscribe({
          next: () => {
            console.log('Dashboard: Data loaded successfully');
            this.isLoading.set(false);
          },
          error: (error) => {
            console.error('Dashboard: Failed to load data', error);
            this.isLoading.set(false);
          }
        });
      } else {
        console.log('Dashboard: No user data, fetching from API');
        // Fetch from API if not in memory
        this.authService.getCurrentUser().subscribe({
          next: (fetchedUser) => {
            console.log('Dashboard: User fetched from API', fetchedUser);
            this.currentUser.set(fetchedUser);
            this.loadUserJourney(fetchedUser.id);
            
            // Load dashboard data after user is fetched
            this.dashboardService.loadAllDashboardData().subscribe({
              next: () => {
                console.log('Dashboard: Data loaded successfully');
                this.isLoading.set(false);
              },
              error: (error) => {
                console.error('Dashboard: Failed to load data', error);
                this.isLoading.set(false);
              }
            });
          },
          error: (error) => {
            console.error('Dashboard: Failed to fetch user', error);
            this.isLoading.set(false);
            this.router.navigate(['/auth/login']);
          }
        });
      }

    } catch (error) {
      console.error('Dashboard: Initialization error', error);
      this.isLoading.set(false);
    }
  }

  /**
   * Wait for authentication state to be ready
   */
  private async waitForAuthentication(): Promise<void> {
    return new Promise((resolve) => {
      // Check if already authenticated
      if (this.authService.isAuthenticated() && this.authService.getCurrentUserValue()) {
        console.log('Dashboard: Already authenticated with user data');
        resolve();
        return;
      }

      // Wait for auth state to be ready (max 5 seconds)
      const timeout = setTimeout(() => {
        console.warn('Dashboard: Authentication wait timeout');
        resolve();
      }, 5000);

      // Check periodically
      const checkInterval = setInterval(() => {
        if (this.authService.isAuthenticated() && this.authService.getCurrentUserValue()) {
          console.log('Dashboard: Authentication ready');
          clearInterval(checkInterval);
          clearTimeout(timeout);
          resolve();
        }
      }, 100);
    });
  }

  private async loadUserJourney(userId: string): Promise<void> {
    try {
      const response = await this.apiService.get<UserJourney>(`/users/${userId}/journey`).toPromise();
      if (response?.data) {
        this.userJourney.set(response.data);
      }
    } catch (error) {
      console.error('Error loading user journey:', error);
    }
  }

  private setupDashboardSubscriptions(): void {
    // Subscribe to dashboard service observables
    this.dashboardService.dashboardStats$.subscribe(stats => {
      this.dashboardStats.set(stats);
    });

    this.dashboardService.recentActivities$.subscribe(activities => {
      this.recentActivities.set(activities);
    });

    this.dashboardService.isLoading$.subscribe(loading => {
      this.isLoading.set(loading);
    });
  }

  private formatRoleName(role: string): string {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }

  // Event handlers
  onQuickAction(action: QuickAction): void {
    this.router.navigate([action.route]);
  }

  onViewAllActivities(): void {
    this.router.navigate(['/activities']);
  }

  onCompleteProfile(): void {
    this.router.navigate(['/profile/complete']);
  }

  onUploadDocuments(): void {
    this.router.navigate(['/documents/upload']);
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatNumber(value: number): string {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  getActivityIcon(type: RecentActivity['type']): string {
    switch (type) {
      case 'LC_CREATED': return 'add_business';
      case 'LC_APPROVED': return 'check_circle';
      case 'LC_REJECTED': return 'cancel';
      case 'DOCUMENT_UPLOADED': return 'cloud_upload';
      case 'PAYMENT_PROCESSED': return 'payment';
      case 'COMPLIANCE_CHECK': return 'verified_user';
      default: return 'notifications';
    }
  }

  getActivityColor(status: RecentActivity['status']): string {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
      case 'WARNING': return 'warning';
      default: return 'default';
    }
  }

  getProgressColor(): string {
    const progress = this.journeyProgress();
    if (progress === 100) return 'success';
    if (progress >= 60) return 'primary';
    return 'warning';
  }

  shouldShowOnboarding(): boolean {
    const journey = this.userJourney();
    return journey ? !journey.isCompleted : true;
  }
}
