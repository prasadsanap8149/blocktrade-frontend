import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PwaService } from '../../../core/services/pwa.service';

@Component({
  selector: 'app-pwa-install',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './pwa-install.component.html',
  styleUrls: ['./pwa-install.component.css']
})
export class PwaInstallComponent {
  private pwaService = inject(PwaService);
  private snackBar = inject(MatSnackBar);

  // Component state
  isInstalling = signal<boolean>(false);
  showInstructions = signal<boolean>(false);

  // Reactive getters
  get canInstall(): boolean {
    return this.pwaService.canInstall();
  }

  get isStandalone(): boolean {
    return this.pwaService.isStandalone();
  }

  get isOnline(): boolean {
    return this.pwaService.isOnline();
  }

  get updateAvailable(): boolean {
    return this.pwaService.updateAvailable();
  }

  get isPwaSupported(): boolean {
    return this.pwaService.isPwaSupported();
  }

  /**
   * Install the PWA
   */
  async installApp(): Promise<void> {
    if (this.isInstalling()) {
      return;
    }

    this.isInstalling.set(true);

    try {
      const installed = await this.pwaService.showInstallPrompt();
      
      if (installed) {
        this.snackBar.open('App installed successfully!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      } else {
        this.showInstallInstructions();
      }
    } catch (error) {
      console.error('Installation failed:', error);
      this.snackBar.open('Installation failed. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } finally {
      this.isInstalling.set(false);
    }
  }

  /**
   * Apply available update
   */
  async applyUpdate(): Promise<void> {
    try {
      await this.pwaService.applyUpdate();
      this.snackBar.open('Update applied successfully!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } catch (error) {
      console.error('Update failed:', error);
      this.snackBar.open('Update failed. Please try again.', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  /**
   * Show install instructions
   */
  showInstallInstructions(): void {
    this.showInstructions.set(true);
    const instructions = this.pwaService.getInstallInstructions();
    
    this.snackBar.open(instructions, 'Got it', {
      duration: 8000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }

  /**
   * Hide install instructions
   */
  hideInstallInstructions(): void {
    this.showInstructions.set(false);
  }

  /**
   * Share the app
   */
  async shareApp(): Promise<void> {
    const shared = await this.pwaService.shareApp({
      title: 'TradeFinance',
      text: 'Check out this amazing trade finance platform!',
      url: window.location.origin
    });

    if (!shared) {
      // Fallback to copying URL
      const copied = await this.pwaService.copyToClipboard(window.location.origin);
      if (copied) {
        this.snackBar.open('App URL copied to clipboard!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom'
        });
      }
    }
  }

  /**
   * Request persistent storage
   */
  async requestStorage(): Promise<void> {
    const granted = await this.pwaService.requestPersistentStorage();
    
    if (granted) {
      this.snackBar.open('Persistent storage granted!', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    } else {
      this.snackBar.open('Persistent storage not available', 'Close', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });
    }
  }

  /**
   * Get app icon URL
   */
  getAppIcon(): string {
    return '/assets/icons/icon-192x192.png';
  }

  /**
   * Get browser name for instructions
   */
  getBrowserName(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Chrome';
    } else if (userAgent.includes('firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('safari')) {
      return 'Safari';
    } else if (userAgent.includes('edg')) {
      return 'Edge';
    } else {
      return 'Browser';
    }
  }
}
