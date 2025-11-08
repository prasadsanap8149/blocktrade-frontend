/**
 * Cryptographic Utility Functions
 * Provides encryption/decryption for local storage and API communication
 */

import { Injectable } from '@angular/core';

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {
  private readonly ALGORITHM = 'AES-GCM';
  private readonly KEY_LENGTH = 256;
  private readonly IV_LENGTH = 12;
  private readonly SALT_LENGTH = 16;
  private readonly TAG_LENGTH = 16;
  
  private readonly MASTER_KEY = 'BlockTrade2024!@#$';

  constructor() {}

  /**
   * Generate a cryptographic key from password and salt
   */
  private async deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.ALGORITHM, length: this.KEY_LENGTH },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generate random bytes
   */
  private generateRandomBytes(length: number): Uint8Array {
    return crypto.getRandomValues(new Uint8Array(length));
  }

  /**
   * Convert string to Uint8Array
   */
  private stringToUint8Array(str: string): Uint8Array {
    return new TextEncoder().encode(str);
  }

  /**
   * Convert Uint8Array to string
   */
  private uint8ArrayToString(arr: Uint8Array): string {
    return new TextDecoder().decode(arr);
  }

  /**
   * Convert Uint8Array to base64
   */
  private uint8ArrayToBase64(arr: Uint8Array): string {
    return btoa(String.fromCharCode(...arr));
  }

  /**
   * Convert base64 to Uint8Array
   */
  private base64ToUint8Array(base64: string): Uint8Array {
    return new Uint8Array(atob(base64).split('').map(char => char.charCodeAt(0)));
  }

  /**
   * Encrypt data using AES-GCM
   */
  async encrypt(data: string, password: string = this.MASTER_KEY): Promise<EncryptedData> {
    try {
      const salt = this.generateRandomBytes(this.SALT_LENGTH);
      const iv = this.generateRandomBytes(this.IV_LENGTH);
      const key = await this.deriveKey(password, salt);
      
      const encodedData = this.stringToUint8Array(data);
      
      const encryptedBuffer = await crypto.subtle.encrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        encodedData
      );

      const encryptedArray = new Uint8Array(encryptedBuffer);
      
      return {
        data: this.uint8ArrayToBase64(encryptedArray),
        iv: this.uint8ArrayToBase64(iv),
        salt: this.uint8ArrayToBase64(salt)
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  async decrypt(encryptedData: EncryptedData, password: string = this.MASTER_KEY): Promise<string> {
    try {
      const salt = this.base64ToUint8Array(encryptedData.salt);
      const iv = this.base64ToUint8Array(encryptedData.iv);
      const data = this.base64ToUint8Array(encryptedData.data);
      
      const key = await this.deriveKey(password, salt);
      
      const decryptedBuffer = await crypto.subtle.decrypt(
        {
          name: this.ALGORITHM,
          iv: iv
        },
        key,
        data
      );

      return this.uint8ArrayToString(new Uint8Array(decryptedBuffer));
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash data using SHA-256
   */
  async hash(data: string): Promise<string> {
    try {
      const encodedData = this.stringToUint8Array(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', encodedData);
      const hashArray = new Uint8Array(hashBuffer);
      return this.uint8ArrayToBase64(hashArray);
    } catch (error) {
      console.error('Hashing failed:', error);
      throw new Error('Failed to hash data');
    }
  }

  /**
   * Generate a random UUID v4
   */
  generateUUID(): string {
    return crypto.randomUUID();
  }

  /**
   * Generate a secure random string
   */
  generateSecureRandomString(length: number = 32): string {
    const array = this.generateRandomBytes(length);
    return this.uint8ArrayToBase64(array).substring(0, length);
  }

  /**
   * Verify hash against original data
   */
  async verifyHash(data: string, hash: string): Promise<boolean> {
    try {
      const computedHash = await this.hash(data);
      return computedHash === hash;
    } catch (error) {
      console.error('Hash verification failed:', error);
      return false;
    }
  }

  /**
   * Encrypt object for storage
   */
  async encryptObject(obj: any, password?: string): Promise<string> {
    const jsonString = JSON.stringify(obj);
    const encrypted = await this.encrypt(jsonString, password);
    return JSON.stringify(encrypted);
  }

  /**
   * Decrypt object from storage
   */
  async decryptObject<T>(encryptedString: string, password?: string): Promise<T> {
    const encryptedData: EncryptedData = JSON.parse(encryptedString);
    const decryptedString = await this.decrypt(encryptedData, password);
    return JSON.parse(decryptedString);
  }
}

/**
 * Static utility functions for quick access
 */
export class CryptoUtil {
  private static cryptoService = new CryptoService();

  /**
   * Quick encrypt function
   */
  static async encrypt(data: string, password?: string): Promise<EncryptedData> {
    return this.cryptoService.encrypt(data, password);
  }

  /**
   * Quick decrypt function
   */
  static async decrypt(encryptedData: EncryptedData, password?: string): Promise<string> {
    return this.cryptoService.decrypt(encryptedData, password);
  }

  /**
   * Quick hash function
   */
  static async hash(data: string): Promise<string> {
    return this.cryptoService.hash(data);
  }

  /**
   * Quick UUID generation
   */
  static generateUUID(): string {
    return this.cryptoService.generateUUID();
  }

  /**
   * Quick secure random string generation
   */
  static generateSecureRandomString(length?: number): string {
    return this.cryptoService.generateSecureRandomString(length);
  }
}
