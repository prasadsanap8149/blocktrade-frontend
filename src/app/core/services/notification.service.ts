/**
 * Notification Service
 * Handles user notifications and toast messages
 */

import { Injectable } from '@angular/core';

export interface NotificationOptions {
  duration?: number;
  action?: string;
  panelClass?: string[];
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly defaultDuration = 5000;

  constructor() {}

  /**
   * Show success notification
   */
  success(message: string, options?: NotificationOptions): void {
    this.show(message, 'success', options);
  }

  /**
   * Show error notification
   */
  error(message: string, options?: NotificationOptions): void {
    this.show(message, 'error', { duration: 8000, ...options });
  }

  /**
   * Show warning notification
   */
  warning(message: string, options?: NotificationOptions): void {
    this.show(message, 'warning', options);
  }

  /**
   * Show info notification
   */
  info(message: string, options?: NotificationOptions): void {
    this.show(message, 'info', options);
  }

  /**
   * Show notification with custom type
   */
  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', options?: NotificationOptions): void {
    // For now, we'll use console logging until we implement proper toast notifications
    // In a real application, this would integrate with a toast library like Angular Material's MatSnackBar
    const timestamp = new Date().toLocaleTimeString();
    const formattedMessage = `[${timestamp}] ${type.toUpperCase()}: ${message}`;
    
    switch (type) {
      case 'success':
        console.log(`✅ ${formattedMessage}`);
        break;
      case 'error':
        console.error(`❌ ${formattedMessage}`);
        break;
      case 'warning':
        console.warn(`⚠️ ${formattedMessage}`);
        break;
      case 'info':
      default:
        console.info(`ℹ️ ${formattedMessage}`);
        break;
    }

    // TODO: Implement actual toast notifications using MatSnackBar or similar
    // Example implementation:
    // this.snackBar.open(message, options?.action, {
    //   duration: options?.duration || this.defaultDuration,
    //   panelClass: [`notification-${type}`, ...(options?.panelClass || [])],
    //   horizontalPosition: options?.horizontalPosition || 'right',
    //   verticalPosition: options?.verticalPosition || 'top'
    // });
  }

  /**
   * Clear all notifications
   */
  clear(): void {
    // TODO: Implement clearing all notifications
    console.log('Clearing all notifications');
  }
}
