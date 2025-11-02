import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="toolbar-content">
        <div class="logo-section">
          <mat-icon class="logo-icon">account_balance</mat-icon>
          <span class="app-title">BlockTrade</span>
        </div>

        <div class="header-actions">
          <!-- Notifications -->
          <button mat-icon-button [matMenuTriggerFor]="notificationMenu">
            <mat-icon [matBadge]="notificationCount" matBadgeColor="warn">notifications</mat-icon>
          </button>

          <!-- User Menu -->
          <button mat-button [matMenuTriggerFor]="userMenu" class="user-button">
            <mat-icon>account_circle</mat-icon>
            <span class="username">{{ (currentUser$ | async)?.firstName }}</span>
            <mat-icon>arrow_drop_down</mat-icon>
          </button>
        </div>
      </div>
    </mat-toolbar>

    <!-- Notification Menu -->
    <mat-menu #notificationMenu="matMenu" class="notification-menu">
      <div class="notification-header">
        <h3>Notifications</h3>
        <button mat-button>Mark all as read</button>
      </div>
      <mat-divider></mat-divider>
      <div class="notification-list">
        <div class="notification-item" *ngFor="let notification of notifications">
          <mat-icon class="notification-icon">{{ notification.icon }}</mat-icon>
          <div class="notification-content">
            <p class="notification-title">{{ notification.title }}</p>
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">{{ notification.timestamp | date:'short' }}</span>
          </div>
        </div>
      </div>
    </mat-menu>

    <!-- User Menu -->
    <mat-menu #userMenu="matMenu">
      <button mat-menu-item (click)="navigateToProfile()">
        <mat-icon>person</mat-icon>
        <span>Profile</span>
      </button>
      <button mat-menu-item (click)="navigateToSettings()">
        <mat-icon>settings</mat-icon>
        <span>Settings</span>
      </button>
      <mat-divider></mat-divider>
      <button mat-menu-item (click)="logout()">
        <mat-icon>logout</mat-icon>
        <span>Logout</span>
      </button>
    </mat-menu>
  `,
  styles: [`
    .header-toolbar {
      position: sticky;
      top: 0;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .toolbar-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .logo-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
    }

    .app-title {
      font-size: 20px;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-button {
      display: flex;
      align-items: center;
      gap: 4px;
      color: white;
    }

    .username {
      margin: 0 4px;
      font-weight: 500;
    }

    .notification-menu {
      width: 320px;
      max-height: 400px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
      cursor: pointer;
    }

    .notification-item:hover {
      background-color: #f5f5f5;
    }

    .notification-icon {
      margin-right: 12px;
      color: #666;
    }

    .notification-content {
      flex: 1;
    }

    .notification-title {
      margin: 0 0 4px 0;
      font-weight: 500;
      font-size: 14px;
    }

    .notification-message {
      margin: 0 0 4px 0;
      font-size: 13px;
      color: #666;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 12px;
      color: #999;
    }

    @media (max-width: 768px) {
      .username {
        display: none;
      }
      
      .notification-menu {
        width: 280px;
      }
    }
  `]
})
export class HeaderComponent {
  currentUser$: Observable<User | null>;
  notificationCount = 5;
  notifications = [
    {
      id: 1,
      icon: 'description',
      title: 'New LC Application',
      message: 'LC-2023-001 has been submitted for review',
      timestamp: new Date(),
      read: false
    },
    {
      id: 2,
      icon: 'check_circle',
      title: 'Document Verified',
      message: 'Commercial invoice has been successfully verified',
      timestamp: new Date(Date.now() - 3600000),
      read: false
    },
    {
      id: 3,
      icon: 'payment',
      title: 'Payment Processed',
      message: 'Payment for LC-2023-002 has been completed',
      timestamp: new Date(Date.now() - 7200000),
      read: true
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private store: Store
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  navigateToProfile(): void {
    this.router.navigate(['/settings/profile']);
  }

  navigateToSettings(): void {
    this.router.navigate(['/settings']);
  }

  logout(): void {
    this.authService.logout();
  }
}
