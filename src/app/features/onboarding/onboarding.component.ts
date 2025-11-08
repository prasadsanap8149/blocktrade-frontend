/**
 * User Onboarding Journey Component
 * 5-step progressive onboarding with blockchain wallet setup
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { OnboardingService } from './services/onboarding.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { User } from '../../core/models/user.model';
import { APP_CONFIG } from '../../shared/constants/app-config.constants';

export interface OnboardingStep {
  number: number;
  title: string;
  description: string;
  completed: boolean;
  current: boolean;
  form?: FormGroup;
}

export interface UserJourneyData {
  step1?: OrganizationSetupData;
  step2?: ProfileCompletionData;
  step3?: SecuritySetupData;
  step4?: PreferencesSetupData;
  step5?: TrainingCompletionData;
}

export interface OrganizationSetupData {
  organizationRole: string;
  department: string;
  reportingManager: string;
  projectAssignments: string;
}

export interface ProfileCompletionData {
  phone: string;
  timezone: string;
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  bio: string;
  profilePicture?: string;
}

export interface SecuritySetupData {
  currentPassword: string;
  passwordConfirmed: boolean;
  securityQuestions: Array<{
    question: string;
    answer: string;
  }>;
  mfaEnabled: boolean;
  backupEmail: string;
}

export interface PreferencesSetupData {
  theme: string;
  language: string;
  notifications: {
    lcUpdates: NotificationPreference;
    documentRequests: NotificationPreference;
    paymentNotifications: NotificationPreference;
    systemAlerts: NotificationPreference;
    marketingEmails: NotificationPreference;
  };
  dashboardLayout: string;
}

export interface NotificationPreference {
  email: boolean;
  inApp: boolean;
  sms: boolean;
}

export interface TrainingCompletionData {
  trainingModulesCompleted: string[];
  complianceAcknowledgment: boolean;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.css']
})
export class OnboardingComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly onboardingService = inject(OnboardingService);
  private readonly notificationService = inject(NotificationService);

  currentStep = 1;
  isLoading = false;
  isCompleted = false;
  showPassword = false;
  currentUser: User | null = null;

  // Form groups for each step
  step1Form!: FormGroup;
  step2Form!: FormGroup;
  step3Form!: FormGroup;
  step4Form!: FormGroup;
  step5Form!: FormGroup;

  // Step configuration
  steps: OnboardingStep[] = [
    { number: 1, title: 'Organization', description: 'Setup your role and department', completed: false, current: true },
    { number: 2, title: 'Profile', description: 'Complete your personal information', completed: false, current: false },
    { number: 3, title: 'Security', description: 'Configure security settings', completed: false, current: false },
    { number: 4, title: 'Preferences', description: 'Customize your experience', completed: false, current: false },
    { number: 5, title: 'Training', description: 'Complete required training', completed: false, current: false }
  ];

  // Form data options
  organizationRoles = [
    { value: 'manager', label: 'Manager' },
    { value: 'senior_analyst', label: 'Senior Analyst' },
    { value: 'analyst', label: 'Analyst' },
    { value: 'specialist', label: 'Specialist' },
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'executive', label: 'Executive' }
  ];

  timezones = [
    { value: 'America/New_York', label: 'Eastern Time (UTC-5)' },
    { value: 'America/Chicago', label: 'Central Time (UTC-6)' },
    { value: 'America/Denver', label: 'Mountain Time (UTC-7)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (UTC-8)' },
    { value: 'Europe/London', label: 'Greenwich Mean Time (UTC+0)' },
    { value: 'Europe/Paris', label: 'Central European Time (UTC+1)' },
    { value: 'Asia/Tokyo', label: 'Japan Standard Time (UTC+9)' },
    { value: 'Asia/Shanghai', label: 'China Standard Time (UTC+8)' },
    { value: 'Asia/Kolkata', label: 'India Standard Time (UTC+5:30)' }
  ];

  countries = [
    { code: 'US', name: 'United States' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'JP', name: 'Japan' },
    { code: 'CN', name: 'China' },
    { code: 'IN', name: 'India' },
    { code: 'AU', name: 'Australia' },
    { code: 'SG', name: 'Singapore' }
  ];

  predefinedQuestions = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What was your mother's maiden name?",
    "What was the name of your first school?",
    "What was your favorite food as a child?",
    "What was the make of your first car?",
    "What street did you live on in third grade?"
  ];

  securityQuestions = [
    { question: '', answer: '' },
    { question: '', answer: '' }
  ];

  themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'auto', label: 'Auto', icon: '🔄' }
  ];

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ];

  notificationTypes = [
    { key: 'lcUpdates', label: 'Letter of Credit Updates' },
    { key: 'documentRequests', label: 'Document Requests' },
    { key: 'paymentNotifications', label: 'Payment Notifications' },
    { key: 'systemAlerts', label: 'System Alerts' },
    { key: 'marketingEmails', label: 'Marketing Communications' }
  ];

  dashboardLayouts = [
    { value: 'compact', label: 'Compact', icon: '📊' },
    { value: 'detailed', label: 'Detailed', icon: '📈' },
    { value: 'cards', label: 'Cards', icon: '🗃️' }
  ];

  trainingModules = [
    {
      id: 'lc-basics',
      title: 'Letter of Credit Basics',
      description: 'Understanding the fundamentals of Letters of Credit',
      duration: '15 minutes',
      completed: false
    },
    {
      id: 'documentary-requirements',
      title: 'Documentary Requirements',
      description: 'Learn about required documents and compliance',
      duration: '20 minutes',
      completed: false
    },
    {
      id: 'risk-management',
      title: 'Risk Management',
      description: 'Identifying and mitigating trade finance risks',
      duration: '25 minutes',
      completed: false
    },
    {
      id: 'regulatory-compliance',
      title: 'Regulatory Compliance',
      description: 'Understanding regulatory requirements and best practices',
      duration: '30 minutes',
      completed: false
    }
  ];

  get progressPercentage(): number {
    const completedSteps = this.steps.filter(step => step.completed).length;
    return (completedSteps / this.steps.length) * 100;
  }

  get allTrainingCompleted(): boolean {
    return this.trainingModules.every(module => module.completed);
  }

  ngOnInit(): void {
    this.initializeForms();
    this.loadCurrentUser();
    this.loadOnboardingProgress();
    
    // Listen to route changes for step navigation
    this.route.params.subscribe(params => {
      if (params['stepNumber']) {
        this.currentStep = parseInt(params['stepNumber']);
        this.updateCurrentStep();
      }
    });
  }

  private initializeForms(): void {
    // Step 1: Organization Setup
    this.step1Form = this.formBuilder.group({
      organizationRole: ['', Validators.required],
      department: ['', Validators.required],
      reportingManager: [''],
      projectAssignments: ['']
    });

    // Step 2: Profile Completion
    this.step2Form = this.formBuilder.group({
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      timezone: ['', Validators.required],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      postalCode: ['', Validators.required],
      bio: ['']
    });

    // Step 3: Security Setup
    this.step3Form = this.formBuilder.group({
      currentPassword: ['', Validators.required],
      mfaEnabled: [false],
      backupEmail: ['', Validators.email]
    });

    // Step 4: Preferences Setup
    this.step4Form = this.formBuilder.group({
      theme: ['light'],
      language: ['en'],
      dashboardLayout: ['detailed'],
      // Notification preferences
      lcUpdates_email: [true],
      lcUpdates_inApp: [true],
      lcUpdates_sms: [false],
      documentRequests_email: [true],
      documentRequests_inApp: [true],
      documentRequests_sms: [true],
      paymentNotifications_email: [true],
      paymentNotifications_inApp: [true],
      paymentNotifications_sms: [true],
      systemAlerts_email: [true],
      systemAlerts_inApp: [true],
      systemAlerts_sms: [false],
      marketingEmails_email: [false],
      marketingEmails_inApp: [false],
      marketingEmails_sms: [false]
    });

    // Step 5: Training & Compliance
    this.step5Form = this.formBuilder.group({
      complianceAcknowledgment: [false, Validators.requiredTrue]
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  private async loadOnboardingProgress(): Promise<void> {
    try {
      const progress = await this.onboardingService.getOnboardingStatus();
      if (progress) {
        this.updateStepsFromProgress(progress);
      }
    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
    }
  }

  private updateStepsFromProgress(progress: any): void {
    // Update steps based on saved progress
    this.steps.forEach((step, index) => {
      if (progress.completedSteps && progress.completedSteps.includes(step.number)) {
        step.completed = true;
      }
    });
    
    if (progress.currentStep) {
      this.currentStep = progress.currentStep;
      this.updateCurrentStep();
    }
  }

  private updateCurrentStep(): void {
    this.steps.forEach(step => {
      step.current = step.number === this.currentStep;
    });
  }

  completeStep(stepNumber: number): void {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    const stepData = this.getStepData(stepNumber);
    
    this.onboardingService.completeOnboardingStep(stepNumber, stepData)
      .subscribe({
        next: (response: any) => {
          this.isLoading = false;
          
          // Mark step as completed
          const step = this.steps.find(s => s.number === stepNumber);
          if (step) {
            step.completed = true;
          }
          
          // Move to next step or complete
          if (stepNumber < this.steps.length) {
            this.nextStep();
          } else {
            this.completeOnboarding();
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          this.notificationService.error(error.message || 'Failed to complete step');
        }
      });
  }

  private getStepData(stepNumber: number): any {
    switch (stepNumber) {
      case 1:
        return this.step1Form.value;
      case 2:
        return {
          ...this.step2Form.value,
          address: {
            street: this.step2Form.value.street,
            city: this.step2Form.value.city,
            state: this.step2Form.value.state,
            country: this.step2Form.value.country,
            postalCode: this.step2Form.value.postalCode
          }
        };
      case 3:
        return {
          ...this.step3Form.value,
          securityQuestions: this.securityQuestions.filter(q => q.question && q.answer)
        };
      case 4:
        return {
          ...this.step4Form.value,
          notifications: this.buildNotificationPreferences()
        };
      case 5:
        return {
          trainingModulesCompleted: this.trainingModules
            .filter(module => module.completed)
            .map(module => module.id),
          complianceAcknowledgment: this.step5Form.value.complianceAcknowledgment
        };
      default:
        return {};
    }
  }

  private buildNotificationPreferences(): any {
    const formValue = this.step4Form.value;
    const notifications: any = {};
    
    this.notificationTypes.forEach(notif => {
      notifications[notif.key] = {
        email: formValue[`${notif.key}_email`],
        inApp: formValue[`${notif.key}_inApp`],
        sms: formValue[`${notif.key}_sms`]
      };
    });
    
    return notifications;
  }

  nextStep(): void {
    if (this.currentStep < this.steps.length) {
      this.currentStep++;
      this.updateCurrentStep();
      this.router.navigate(['/onboarding/step', this.currentStep]);
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateCurrentStep();
      this.router.navigate(['/onboarding/step', this.currentStep]);
    }
  }

  startTrainingModule(module: any): void {
    // Simulate training module completion
    setTimeout(() => {
      module.completed = true;
      this.notificationService.success(`${module.title} completed successfully!`);
    }, 2000);
  }

  completeOnboarding(): void {
    this.isCompleted = true;
    this.notificationService.success('Onboarding completed successfully!');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
      this.goToDashboard();
    }, 3000);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string, form: FormGroup): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}

