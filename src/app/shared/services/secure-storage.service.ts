/**
 * Secure Storage Service
 * Provides encrypted local storage for sensitive data
 */

import { Injectable } from '@angular/core';
import { CryptoService } from '../utils/crypto.util';
import { APP_CONFIG } from '../constants/app-config.constants';

export interface StorageOptions {
  encrypt?: boolean;
  expiry?: number; // Expiry time in milliseconds
  compress?: boolean;
}

export interface StorageItem {
  value: any;
  timestamp: number;
  expiry?: number;
  encrypted?: boolean;
  compressed?: boolean;
  hash?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecureStorageService {
  private readonly PREFIX = 'bt_secure_';
  
  constructor(private cryptoService: CryptoService) {}

  /**
   * Set item in secure storage
   */
  async setItem(key: string, value: any, options: StorageOptions = {}): Promise<void> {
    try {
      const storageItem: StorageItem = {
        value: value,
        timestamp: Date.now(),
        encrypted: options.encrypt || false,
        compressed: options.compress || false
      };

      if (options.expiry) {
        storageItem.expiry = Date.now() + options.expiry;
      }

      let serializedValue = JSON.stringify(storageItem);

      // Compress if requested
      if (options.compress) {
        serializedValue = this.compress(serializedValue);
      }

      // Encrypt if requested
      if (options.encrypt) {
        const encrypted = await this.cryptoService.encrypt(serializedValue);
        serializedValue = JSON.stringify(encrypted);
        storageItem.hash = await this.cryptoService.hash(JSON.stringify(value));
      }

      localStorage.setItem(this.PREFIX + key, serializedValue);
      // Reduced logging - only log for important items
      if (['user_data', 'access_token', 'refresh_token'].includes(key)) {
        console.log(`✓ Saved ${key} to secure storage`);
      }
    } catch (error) {
      console.error('Failed to set secure storage item:', error);
      throw new Error(`Failed to store item: ${key} - ${error}`);
    }
  }

  /**
   * Get item from secure storage
   */
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const storedValue = localStorage.getItem(this.PREFIX + key);
      
      if (!storedValue) {
        return null;
      }

      let serializedValue = storedValue;
      let storageItem: StorageItem;

      // Try to parse as encrypted data first
      try {
        const possibleEncryptedData = JSON.parse(storedValue);
        if (possibleEncryptedData.data && possibleEncryptedData.iv && possibleEncryptedData.salt) {
          // This is encrypted data
          serializedValue = await this.cryptoService.decrypt(possibleEncryptedData);
        }
      } catch (error) {
        // Not encrypted, continue with normal parsing
      }

      // Decompress if needed
      if (this.isCompressed(serializedValue)) {
        serializedValue = this.decompress(serializedValue);
      }

      storageItem = JSON.parse(serializedValue);

      // Check expiry
      if (storageItem.expiry && Date.now() > storageItem.expiry) {
        this.removeItem(key);
        return null;
      }

      // Verify integrity if hash exists
      if (storageItem.hash) {
        const currentHash = await this.cryptoService.hash(JSON.stringify(storageItem.value));
        if (currentHash !== storageItem.hash) {
          console.warn('Data integrity check failed for key:', key);
          this.removeItem(key);
          return null;
        }
      }

      return storageItem.value as T;
    } catch (error) {
      console.error('Failed to get secure storage item:', error);
      this.removeItem(key); // Remove corrupted data
      return null;
    }
  }

  /**
   * Remove item from secure storage
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }

  /**
   * Clear all secure storage items
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Check if item exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(this.PREFIX + key) !== null;
  }

  /**
   * Get all secure storage keys
   */
  getKeys(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.PREFIX))
      .map(key => key.substring(this.PREFIX.length));
  }

  /**
   * Get storage usage information
   */
  getStorageInfo(): { used: number; available: number; total: number } {
    let used = 0;
    const keys = Object.keys(localStorage);
    
    keys.forEach(key => {
      if (key.startsWith(this.PREFIX)) {
        const value = localStorage.getItem(key);
        if (value) {
          used += key.length + value.length;
        }
      }
    });

    // Estimate total localStorage capacity (usually 5-10MB)
    const total = 10 * 1024 * 1024; // 10MB estimate
    const available = total - used;

    return { used, available, total };
  }

  /**
   * Set item with automatic encryption for sensitive data
   */
  async setSecureItem(key: string, value: any, expiry?: number): Promise<void> {
    return this.setItem(key, value, { 
      encrypt: true, 
      compress: true, 
      expiry 
    });
  }

  /**
   * Set user data with encryption
   */
  async setUserData(userData: any): Promise<void> {
    try {
      await this.setSecureItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA.replace('bt_', ''), 
        userData,
        APP_CONFIG.SECURITY.SESSION_TIMEOUT
      );
      console.log('✓ User data persisted to secure storage');
    } catch (error) {
      console.error('Failed to save user data:', error);
      throw error;
    }
  }

  /**
   * Get user data with decryption
   */
  async getUserData<T>(): Promise<T | null> {
    return this.getItem<T>(APP_CONFIG.STORAGE_KEYS.USER_DATA.replace('bt_', ''));
  }

  /**
   * Set auth tokens with encryption
   */
  async setAuthTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await Promise.all([
        this.setSecureItem(
          APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN.replace('bt_', ''), 
          accessToken,
          APP_CONFIG.SECURITY.SESSION_TIMEOUT
        ),
        this.setSecureItem(
          APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN.replace('bt_', ''), 
          refreshToken,
          APP_CONFIG.SECURITY.SESSION_TIMEOUT * 2 // Refresh token lasts longer
        )
      ]);
      console.log('✓ Auth tokens persisted to secure storage');
    } catch (error) {
      console.error('Failed to save auth tokens:', error);
      throw error;
    }
  }

  /**
   * Get auth tokens with decryption
   */
  async getAuthTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.getItem<string>(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN.replace('bt_', '')),
      this.getItem<string>(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN.replace('bt_', ''))
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Clear auth data
   */
  clearAuthData(): void {
    this.removeItem(APP_CONFIG.STORAGE_KEYS.ACCESS_TOKEN.replace('bt_', ''));
    this.removeItem(APP_CONFIG.STORAGE_KEYS.REFRESH_TOKEN.replace('bt_', ''));
    this.removeItem(APP_CONFIG.STORAGE_KEYS.USER_DATA.replace('bt_', ''));
  }

  /**
   * Set user preferences
   */
  async setUserPreferences(preferences: any): Promise<void> {
    return this.setItem(
      APP_CONFIG.STORAGE_KEYS.PREFERENCES.replace('bt_', ''), 
      preferences,
      { encrypt: false, compress: true }
    );
  }

  /**
   * Get user preferences
   */
  async getUserPreferences<T>(): Promise<T | null> {
    return this.getItem<T>(APP_CONFIG.STORAGE_KEYS.PREFERENCES.replace('bt_', ''));
  }

  /**
   * Set onboarding status
   */
  async setOnboardingStatus(status: any): Promise<void> {
    return this.setSecureItem(
      APP_CONFIG.STORAGE_KEYS.ONBOARDING_STATUS.replace('bt_', ''), 
      status
    );
  }

  /**
   * Get onboarding status
   */
  async getOnboardingStatus<T>(): Promise<T | null> {
    return this.getItem<T>(APP_CONFIG.STORAGE_KEYS.ONBOARDING_STATUS.replace('bt_', ''));
  }

  // Private helper methods

  /**
   * Simple compression using JSON stringification optimization
   */
  private compress(data: string): string {
    // Simple compression - in production, consider using a library like pako
    try {
      // Remove unnecessary whitespace and optimize JSON
      const parsed = JSON.parse(data);
      return JSON.stringify(parsed);
    } catch {
      return data;
    }
  }

  /**
   * Simple decompression
   */
  private decompress(data: string): string {
    return data; // For now, just return as-is since we're using simple compression
  }

  /**
   * Check if data is compressed
   */
  private isCompressed(data: string): boolean {
    // Simple check - in production, use proper compression detection
    return false; // For now, we're not using real compression
  }

  /**
   * Cleanup expired items
   */
  async cleanupExpiredItems(): Promise<number> {
    let cleanedCount = 0;
    const keys = this.getKeys();

    for (const key of keys) {
      try {
        const item = await this.getItem(key);
        if (item === null) {
          // Item was expired and automatically removed
          cleanedCount++;
        }
      } catch (error) {
        // Remove corrupted items
        this.removeItem(key);
        cleanedCount++;
      }
    }

    return cleanedCount;
  }

  /**
   * Export secure storage data (for backup/migration)
   */
  async exportData(): Promise<{ [key: string]: any }> {
    const data: { [key: string]: any } = {};
    const keys = this.getKeys();

    for (const key of keys) {
      try {
        const value = await this.getItem(key);
        if (value !== null) {
          data[key] = value;
        }
      } catch (error) {
        console.warn(`Failed to export data for key: ${key}`, error);
      }
    }

    return data;
  }

  /**
   * Import secure storage data (for backup/migration)
   */
  async importData(data: { [key: string]: any }, options: StorageOptions = {}): Promise<void> {
    for (const [key, value] of Object.entries(data)) {
      try {
        await this.setItem(key, value, options);
      } catch (error) {
        console.warn(`Failed to import data for key: ${key}`, error);
      }
    }
  }
}
