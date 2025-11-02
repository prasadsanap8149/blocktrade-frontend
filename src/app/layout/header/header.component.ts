import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { User } from '../../shared/models/user.model';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  @Input() currentUser: User | null = null;
  @Input() isMobile = false;
  @Input() sidenavOpened = false;
  @Input() showSearch = true;

  @Output() menuToggle = new EventEmitter<void>();
  @Output() search = new EventEmitter<string>();
  @Output() logout = new EventEmitter<void>();
  @Output() themeToggle = new EventEmitter<void>();

  // Reactive state using signals
  searchQuery = signal<string>('');
  isDarkTheme = signal<boolean>(false);
  showMobileSearch = signal<boolean>(false);
  notifications = signal<Notification[]>([]);
  unreadNotifications = signal<number>(0);

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.loadNotifications();
    this.detectTheme();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    // Initialize component state
    this.searchQuery.set('');
    
    // Load user preferences
    this.loadUserPreferences();
  }

  private loadUserPreferences(): void {
    // Load theme preference from localStorage
    const savedTheme = localStorage.getItem('blocktrade-theme');
    this.isDarkTheme.set(savedTheme === 'dark');
    
    // Apply theme
    this.applyTheme();
  }

  private detectTheme(): void {
    // Detect system theme preference
    if (!localStorage.getItem('blocktrade-theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkTheme.set(prefersDark);
      this.applyTheme();
    }
  }

  private loadNotifications(): void {
    // Mock notifications - replace with actual service call
    const mockNotifications: Notification[] = [
      {
        id: '1',
        title: 'New LC Application',
        message: 'Letter of Credit LC-2023-001 requires approval',
        type: 'info',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        read: false,
        actionUrl: '/letters-of-credit/LC-2023-001',
        actionLabel: 'Review'
      },
      {
        id: '2',
        title: 'Document Verification',
        message: 'Documents submitted for LC-2023-002 need verification',
        type: 'warning',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        read: false,
        actionUrl: '/documents/verify',
        actionLabel: 'Verify'
      },
      {
        id: '3',
        title: 'Payment Processed',
        message: 'Payment for LC-2023-003 has been successfully processed',
        type: 'success',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        read: true
      },
      {
        id: '4',
        title: 'System Maintenance',
        message: 'Scheduled maintenance will begin at 2:00 AM UTC',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        read: true
      }
    ];

    this.notifications.set(mockNotifications);
    this.updateUnreadCount();
  }

  private updateUnreadCount(): void {
    const unreadCount = this.notifications().filter(n => !n.read).length;
    this.unreadNotifications.set(unreadCount);
  }

  // Event Handlers
  onMenuToggle(): void {
    this.menuToggle.emit();
  }

  onSearch(): void {
    const query = this.searchQuery();
    if (query.trim()) {
      this.search.emit(query);
      // Navigate to search results
      this.router.navigate(['/search'], { queryParams: { q: query } });
    }
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  openMobileSearch(): void {
    this.showMobileSearch.set(true);
    // Focus on search input after animation
    setTimeout(() => {
      const searchInput = document.querySelector('.mobile-search input') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
      }
    }, 100);
  }

  closeMobileSearch(): void {
    this.showMobileSearch.set(false);
    this.clearSearch();
  }

  navigateToHome(): void {
    this.router.navigate(['/dashboard']);
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkTheme();
    this.isDarkTheme.set(newTheme);
    this.applyTheme();
    this.saveThemePreference(newTheme);
    this.themeToggle.emit();
  }

  private applyTheme(): void {
    const isDark = this.isDarkTheme();
    document.body.classList.toggle('dark-theme', isDark);
    document.body.classList.toggle('light-theme', !isDark);
  }

  private saveThemePreference(isDark: boolean): void {
    localStorage.setItem('blocktrade-theme', isDark ? 'dark' : 'light');
  }

  onLogout(): void {
    // Clear user data and navigate to login
    localStorage.removeItem('blocktrade-auth-token');
    localStorage.removeItem('blocktrade-user');
    this.logout.emit();
    this.router.navigate(['/auth/login']);
  }

  // Notification Methods
  markAsRead(notification: Notification): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => 
      n.id === notification.id ? { ...n, read: true } : n
    );
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();

    // Navigate to action URL if provided
    if (notification.actionUrl) {
      this.router.navigate([notification.actionUrl]);
    }
  }

  markAllAsRead(): void {
    const notifications = this.notifications();
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    this.notifications.set(updatedNotifications);
    this.updateUnreadCount();
  }

  getNotificationIcon(type: Notification['type']): string {
    const icons = {
      info: 'info',
      warning: 'warning',
      error: 'error',
      success: 'check_circle'
    };
    return icons[type] || 'info';
  }

  trackNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  // Utility Methods
  hasPermission(permissions: string[]): boolean {
    if (!this.currentUser?.permissions) return false;
    return permissions.some(permission => 
      this.currentUser!.permissions!.includes(permission)
    );
  }

  formatRole(role: string): string {
    return role.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  formatTime(timestamp: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) { // 24 hours
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d ago`;
    }
  }

  // Accessibility methods
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (event.target === event.currentTarget) {
        (event.target as HTMLElement).click();
      }
    }
  }

  // Search suggestions (future enhancement)
  getSearchSuggestions(query: string): string[] {
    // This would typically call a service to get search suggestions
    const suggestions = [
      'LC-2023-001',
      'ABC Corporation',
      'Commercial Invoice',
      'Bill of Lading',
      'Payment Processing'
    ];

    return suggestions.filter(suggestion => 
      suggestion.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 5);
  }
}
