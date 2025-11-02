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
  type: 'LC_CREATED' | 'LC_APPROVED' | 'DOCUMENT_UPLOADED' | 'PAYMENT_PROCESSED';
  title: string;
  description: string;
  timestamp: Date;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  amount?: number;
  currency?: string;
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
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
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
      this.isLoading.set(true);
      
      // Get current user
      this.authService.getCurrentUser().subscribe(user => {
        if (user) {
          this.currentUser.set(user);
          this.loadUserJourney(user.id);
        }
      });

      // Load dashboard data in parallel
      await Promise.all([
        this.loadDashboardStats(),
        this.loadRecentActivities()
      ]);

    } catch (error) {
      console.error('Error initializing dashboard:', error);
    } finally {
      this.isLoading.set(false);
    }
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

  private async loadDashboardStats(): Promise<void> {
    try {
      const response = await this.apiService.get<DashboardStats>('/dashboard/stats').toPromise();
      if (response?.data) {
        this.dashboardStats.set(response.data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  }

  private async loadRecentActivities(): Promise<void> {
    try {
      const response = await this.apiService.get<RecentActivity[]>('/dashboard/activities', {
        limit: 10
      }).toPromise();
      if (response?.data) {
        this.recentActivities.set(response.data);
      }
    } catch (error) {
      console.error('Error loading recent activities:', error);
    }
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
      case 'DOCUMENT_UPLOADED': return 'cloud_upload';
      case 'PAYMENT_PROCESSED': return 'payment';
      default: return 'notifications';
    }
  }

  getActivityColor(status: RecentActivity['status']): string {
    switch (status) {
      case 'SUCCESS': return 'success';
      case 'PENDING': return 'warning';
      case 'FAILED': return 'error';
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
