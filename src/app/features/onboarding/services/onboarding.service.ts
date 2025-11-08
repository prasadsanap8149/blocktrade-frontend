/**
 * Onboarding Service
 * Handles user onboarding journey progress and completion
 */

import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { ApiService } from '../../../core/services/api.service';
import { SecureStorageService } from '../../../shared/services/secure-storage.service';
import { API_ENDPOINTS } from '../../../shared/constants/api-endpoint.constants';
import { APP_CONFIG } from '../../../shared/constants/app-config.constants';

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  totalSteps: number;
  data: { [key: string]: any };
  isCompleted: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface OnboardingStepData {
  step: number;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class OnboardingService {
  private readonly apiService = inject(ApiService);
  private readonly secureStorage = inject(SecureStorageService);

  private readonly STORAGE_KEY = 'onboarding_progress';

  /**
   * Get current onboarding status
   */
  async getOnboardingStatus(): Promise<OnboardingProgress | null> {
    try {
      // Try to get from secure storage first
      const localProgress = await this.secureStorage.getOnboardingStatus<OnboardingProgress>();
      
      if (localProgress) {
        return localProgress;
      }

      // If not in local storage, try to fetch from API
      return this.fetchOnboardingStatusFromAPI();
    } catch (error) {
      console.error('Failed to get onboarding status:', error);
      return null;
    }
  }

  /**
   * Complete an onboarding step
   */
  completeOnboardingStep(stepNumber: number, stepData: any): Observable<any> {
    const requestData: OnboardingStepData = {
      step: stepNumber,
      data: stepData
    };

    return this.apiService.post(API_ENDPOINTS.JOURNEY.ONBOARDING_STEP, requestData).pipe(
      tap(async (response) => {
        if (response?.success) {
          // Update local storage
          await this.updateLocalProgress(stepNumber, stepData);
        }
      })
    );
  }

  /**
   * Initialize onboarding process
   */
  async initializeOnboarding(): Promise<OnboardingProgress> {
    const progress: OnboardingProgress = {
      currentStep: 1,
      completedSteps: [],
      totalSteps: APP_CONFIG.JOURNEY.TOTAL_STEPS,
      data: {},
      isCompleted: false,
      startedAt: new Date().toISOString()
    };

    await this.secureStorage.setOnboardingStatus(progress);
    return progress;
  }

  /**
   * Mark onboarding as completed
   */
  async completeOnboarding(): Promise<void> {
    try {
      const progress = await this.getOnboardingStatus();
      if (progress) {
        progress.isCompleted = true;
        progress.completedAt = new Date().toISOString();
        progress.completedSteps = Array.from({ length: progress.totalSteps }, (_, i) => i + 1);
        
        await this.secureStorage.setOnboardingStatus(progress);
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
    }
  }

  /**
   * Reset onboarding progress
   */
  async resetOnboarding(): Promise<void> {
    try {
      this.secureStorage.removeItem('onboarding_status');
    } catch (error) {
      console.error('Failed to reset onboarding:', error);
    }
  }

  /**
   * Check if user has completed onboarding
   */
  async isOnboardingCompleted(): Promise<boolean> {
    try {
      const progress = await this.getOnboardingStatus();
      return progress?.isCompleted || false;
    } catch (error) {
      console.error('Failed to check onboarding completion:', error);
      return false;
    }
  }

  /**
   * Get onboarding completion percentage
   */
  async getOnboardingProgress(): Promise<number> {
    try {
      const progress = await this.getOnboardingStatus();
      if (!progress) return 0;
      
      return (progress.completedSteps.length / progress.totalSteps) * 100;
    } catch (error) {
      console.error('Failed to get onboarding progress:', error);
      return 0;
    }
  }

  /**
   * Save step data temporarily
   */
  async saveStepData(stepNumber: number, data: any): Promise<void> {
    try {
      const progress = await this.getOnboardingStatus();
      if (progress) {
        progress.data[`step${stepNumber}`] = data;
        await this.secureStorage.setOnboardingStatus(progress);
      }
    } catch (error) {
      console.error('Failed to save step data:', error);
    }
  }

  /**
   * Get saved step data
   */
  async getStepData(stepNumber: number): Promise<any> {
    try {
      const progress = await this.getOnboardingStatus();
      return progress?.data[`step${stepNumber}`] || null;
    } catch (error) {
      console.error('Failed to get step data:', error);
      return null;
    }
  }

  /**
   * Skip onboarding (if allowed)
   */
  async skipOnboarding(): Promise<void> {
    try {
      const progress = await this.getOnboardingStatus() || await this.initializeOnboarding();
      progress.isCompleted = true;
      progress.completedAt = new Date().toISOString();
      
      await this.secureStorage.setOnboardingStatus(progress);
    } catch (error) {
      console.error('Failed to skip onboarding:', error);
    }
  }

  // Private methods

  /**
   * Fetch onboarding status from API
   */
  private async fetchOnboardingStatusFromAPI(): Promise<OnboardingProgress | null> {
    try {
      const response = await this.apiService.get(API_ENDPOINTS.JOURNEY.ONBOARDING_STATUS).toPromise();
      
      if (response?.success && response.data) {
        const apiProgress = this.mapAPIResponseToProgress(response.data);
        
        // Save to local storage for future use
        await this.secureStorage.setOnboardingStatus(apiProgress);
        
        return apiProgress;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to fetch onboarding status from API:', error);
      return null;
    }
  }

  /**
   * Map API response to local progress format
   */
  private mapAPIResponseToProgress(apiData: any): OnboardingProgress {
    return {
      currentStep: apiData.currentStep || 1,
      completedSteps: apiData.completedSteps || [],
      totalSteps: apiData.totalSteps || APP_CONFIG.JOURNEY.TOTAL_STEPS,
      data: apiData.stepData || {},
      isCompleted: apiData.isCompleted || false,
      startedAt: apiData.startedAt || new Date().toISOString(),
      completedAt: apiData.completedAt
    };
  }

  /**
   * Update local progress after completing a step
   */
  private async updateLocalProgress(stepNumber: number, stepData: any): Promise<void> {
    try {
      let progress = await this.getOnboardingStatus();
      
      if (!progress) {
        progress = await this.initializeOnboarding();
      }

      // Add step to completed steps if not already there
      if (!progress.completedSteps.includes(stepNumber)) {
        progress.completedSteps.push(stepNumber);
        progress.completedSteps.sort((a, b) => a - b);
      }

      // Update current step to next step
      if (stepNumber < progress.totalSteps) {
        progress.currentStep = stepNumber + 1;
      }

      // Save step data
      progress.data[`step${stepNumber}`] = stepData;

      // Check if all steps are completed
      if (progress.completedSteps.length === progress.totalSteps) {
        progress.isCompleted = true;
        progress.completedAt = new Date().toISOString();
      }

      await this.secureStorage.setOnboardingStatus(progress);
    } catch (error) {
      console.error('Failed to update local progress:', error);
    }
  }
}
