import { Injectable, signal } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter, switchMap } from 'rxjs/operators';
import { fromEvent, merge, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  // Signals for reactive state management
  isOnline = signal<boolean>(navigator.onLine);
  isStandalone = signal<boolean>(this.checkStandalone());
  updateAvailable = signal<boolean>(false);
  installPrompt = signal<any>(null);

  constructor(private swUpdate: SwUpdate) {
    this.initializeOnlineStatus();
    this.initializeUpdateCheck();
    this.initializeInstallPrompt();
  }

  /**
   * Initialize online/offline status monitoring
   */
  private initializeOnlineStatus(): void {
    merge(
      fromEvent(window, 'online'),
      fromEvent(window, 'offline')
    ).subscribe(() => {
      this.isOnline.set(navigator.onLine);
    });
  }

  /**
   * Check if app is running in standalone mode
   */
  private checkStandalone(): boolean {
    return (window.matchMedia('(display-mode: standalone)').matches) ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://');
  }

  /**
   * Initialize service worker update checking
   */
  private initializeUpdateCheck(): void {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    // Check for updates every 6 hours
    this.swUpdate.checkForUpdate();
    setInterval(() => {
      this.swUpdate.checkForUpdate();
    }, 6 * 60 * 60 * 1000);

    // Listen for version ready events
    this.swUpdate.versionUpdates
      .pipe(
        filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY')
      )
      .subscribe(() => {
        this.updateAvailable.set(true);
      });
  }

  /**
   * Initialize install prompt handling
   */
  private initializeInstallPrompt(): void {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt.set(e);
    });

    window.addEventListener('appinstalled', () => {
      this.installPrompt.set(null);
      this.isStandalone.set(true);
    });
  }

  /**
   * Show install prompt to user
   */
  async showInstallPrompt(): Promise<boolean> {
    const prompt = this.installPrompt();
    if (!prompt) {
      return false;
    }

    try {
      const result = await prompt.prompt();
      await result.userChoice;
      
      if (result.userChoice.outcome === 'accepted') {
        this.installPrompt.set(null);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Install prompt failed:', error);
      return false;
    }
  }

  /**
   * Apply pending app update
   */
  async applyUpdate(): Promise<void> {
    if (!this.swUpdate.isEnabled || !this.updateAvailable()) {
      return;
    }

    try {
      await this.swUpdate.activateUpdate();
      this.updateAvailable.set(false);
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
    }
  }

  /**
   * Check if PWA features are supported
   */
  isPwaSupported(): boolean {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  /**
   * Check if app can be installed
   */
  canInstall(): boolean {
    return !!this.installPrompt() && !this.isStandalone();
  }

  /**
   * Get installation instructions based on platform
   */
  getInstallInstructions(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'Click the install button in the address bar or use the "Install App" option in the menu.';
    } else if (userAgent.includes('firefox')) {
      return 'Look for the "Install" option in the address bar or page menu.';
    } else if (userAgent.includes('safari')) {
      return 'Tap the Share button and select "Add to Home Screen".';
    } else if (userAgent.includes('edg')) {
      return 'Click the "Install App" button in the address bar or use the app menu.';
    } else {
      return 'Look for install options in your browser menu or address bar.';
    }
  }

  /**
   * Share app using Web Share API
   */
  async shareApp(data?: { title?: string; text?: string; url?: string }): Promise<boolean> {
    if (!navigator.share) {
      return false;
    }

    const shareData = {
      title: data?.title || 'TradeFinance',
      text: data?.text || 'Secure blockchain-powered trade finance platform',
      url: data?.url || window.location.origin
    };

    try {
      await navigator.share(shareData);
      return true;
    } catch (error) {
      console.error('Share failed:', error);
      return false;
    }
  }

  /**
   * Request persistent storage
   */
  async requestPersistentStorage(): Promise<boolean> {
    if (!navigator.storage || !navigator.storage.persist) {
      return false;
    }

    try {
      const persistent = await navigator.storage.persist();
      return persistent;
    } catch (error) {
      console.error('Persistent storage request failed:', error);
      return false;
    }
  }

  /**
   * Get storage estimate
   */
  async getStorageEstimate(): Promise<StorageEstimate | null> {
    if (!navigator.storage || !navigator.storage.estimate) {
      return null;
    }

    try {
      return await navigator.storage.estimate();
    } catch (error) {
      console.error('Storage estimate failed:', error);
      return null;
    }
  }

  /**
   * Check if device supports camera
   */
  supportsCameraAccess(): boolean {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  }

  /**
   * Check if device supports notifications
   */
  supportsNotifications(): boolean {
    return 'Notification' in window;
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!this.supportsNotifications()) {
      return 'denied';
    }

    try {
      return await Notification.requestPermission();
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return 'denied';
    }
  }

  /**
   * Show local notification
   */
  showNotification(title: string, options?: NotificationOptions): void {
    if (!this.supportsNotifications() || Notification.permission !== 'granted') {
      return;
    }

    const defaultOptions: NotificationOptions = {
      icon: '/assets/icons/icon-192x192.png',
      badge: '/assets/icons/icon-72x72.png',
      ...options
    };

    new Notification(title, defaultOptions);
  }

  /**
   * Get device orientation
   */
  getOrientation(): string {
    if (screen.orientation) {
      return screen.orientation.type;
    }
    return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
  }

  /**
   * Lock orientation (if supported)
   */
  async lockOrientation(orientation: string): Promise<boolean> {
    try {
      const screenOrientation = (screen as any).orientation;
      if (!screenOrientation || !screenOrientation.lock) {
        return false;
      }

      await screenOrientation.lock(orientation);
      return true;
    } catch (error) {
      console.error('Orientation lock failed:', error);
      return false;
    }
  }

  /**
   * Unlock orientation
   */
  unlockOrientation(): void {
    try {
      const screenOrientation = (screen as any).orientation;
      if (screenOrientation && screenOrientation.unlock) {
        screenOrientation.unlock();
      }
    } catch (error) {
      console.error('Orientation unlock failed:', error);
    }
  }

  /**
   * Copy text to clipboard
   */
  async copyToClipboard(text: string): Promise<boolean> {
    if (!navigator.clipboard) {
      return this.fallbackCopyToClipboard(text);
    }

    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Clipboard write failed:', error);
      return this.fallbackCopyToClipboard(text);
    }
  }

  /**
   * Fallback copy to clipboard for older browsers
   */
  private fallbackCopyToClipboard(text: string): boolean {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    } catch (error) {
      console.error('Fallback copy failed:', error);
      document.body.removeChild(textArea);
      return false;
    }
  }

  /**
   * Check if device has sufficient battery
   */
  async checkBattery(): Promise<{ level: number; charging: boolean } | null> {
    try {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging
      };
    } catch (error) {
      console.error('Battery API not supported:', error);
      return null;
    }
  }

  /**
   * Get network information
   */
  getNetworkInfo(): { type: string; effectiveType: string; downlink: number } | null {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (!connection) {
      return null;
    }

    return {
      type: connection.type || 'unknown',
      effectiveType: connection.effectiveType || 'unknown',
      downlink: connection.downlink || 0
    };
  }

  /**
   * Vibrate device (if supported)
   */
  vibrate(pattern: number | number[]): boolean {
    if (!navigator.vibrate) {
      return false;
    }

    try {
      navigator.vibrate(pattern);
      return true;
    } catch (error) {
      console.error('Vibration failed:', error);
      return false;
    }
  }
}
