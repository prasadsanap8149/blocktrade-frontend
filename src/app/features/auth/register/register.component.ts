import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MESSAGES } from '../../../shared/constants/messages.constants';
import { APP_CONFIG } from '../../../shared/constants/app-config.constants';
import { UserRegistration, OrganizationType, UserRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSelectModule,
    MatStepperModule,
    MatSnackBarModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);

  // Signals for reactive state management
  isLoading = signal(false);
  hidePassword = signal(true);
  hideConfirmPassword = signal(true);
  currentStep = signal(0);
  registrationSuccess = signal(false);
  apiErrors = signal<string[]>([]);
  
  personalInfoForm!: FormGroup;
  organizationForm!: FormGroup;
  securityForm!: FormGroup;
  returnUrl = '/dashboard';

  // Constants for template
  readonly MESSAGES = MESSAGES;
  readonly APP_NAME = APP_CONFIG.APP_NAME;
  readonly OrganizationType = OrganizationType;

  // Organization types for dropdown
  organizationTypes = [
    { value: OrganizationType.BANK, label: 'Bank' },
    { value: OrganizationType.NBFC, label: 'NBFC (Non-Banking Financial Company)' },
    { value: OrganizationType.CORPORATE, label: 'Corporate' },
    { value: OrganizationType.LOGISTICS, label: 'Logistics' },
    { value: OrganizationType.INSURANCE, label: 'Insurance' }
  ];

  ngOnInit(): void {
    this.initializeForms();
    this.getReturnUrl();
    this.checkIfAlreadyAuthenticated();
  }

  private initializeForms(): void {
    this.personalInfoForm = this.formBuilder.group({
      firstName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z\s]*$/)
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(APP_CONFIG.VALIDATION.EMAIL_PATTERN)
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern(APP_CONFIG.VALIDATION.PHONE_PATTERN)
      ]]
    });

    this.organizationForm = this.formBuilder.group({
      organizationName: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]],
      organizationType: ['', [Validators.required]],
      organizationId: [''], // Optional for existing organizations
      address: this.formBuilder.group({
        street: ['', [Validators.required]],
        city: ['', [Validators.required]],
        state: ['', [Validators.required]],
        country: ['', [Validators.required]],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5,10}$/)]]
      })
    });

    this.securityForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(APP_CONFIG.SECURITY.PASSWORD_MIN_LENGTH),
        Validators.pattern(APP_CONFIG.SECURITY.PASSWORD_PATTERN)
      ]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    
    return null;
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private checkIfAlreadyAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  nextStep(): void {
    const currentStepForm = this.getCurrentStepForm();
    if (currentStepForm.valid) {
      this.currentStep.update(step => step + 1);
      this.apiErrors.set([]);
    } else {
      this.markFormGroupTouched(currentStepForm);
    }
  }

  previousStep(): void {
    this.currentStep.update(step => Math.max(0, step - 1));
    this.apiErrors.set([]);
  }

  private getCurrentStepForm(): FormGroup {
    switch (this.currentStep()) {
      case 0: return this.personalInfoForm;
      case 1: return this.organizationForm;
      case 2: return this.securityForm;
      default: return this.personalInfoForm;
    }
  }

  onSubmit(): void {
    if (this.isAllFormsValid() && !this.isLoading()) {
      this.performRegistration();
    } else {
      this.markAllFormsTouched();
    }
  }

  private isAllFormsValid(): boolean {
    return this.personalInfoForm.valid && 
           this.organizationForm.valid && 
           this.securityForm.valid;
  }

  private performRegistration(): void {
    this.isLoading.set(true);
    this.apiErrors.set([]);

    const registrationData: UserRegistration = {
      // Personal Information
      username: this.securityForm.get('username')?.value.trim(),
      email: this.personalInfoForm.get('email')?.value.trim().toLowerCase(),
      password: this.securityForm.get('password')?.value,
      confirmPassword: this.securityForm.get('confirmPassword')?.value,
      firstName: this.personalInfoForm.get('firstName')?.value.trim(),
      lastName: this.personalInfoForm.get('lastName')?.value.trim(),
      phone: this.personalInfoForm.get('phone')?.value.trim(),
      
      // Organization Information
      organizationName: this.organizationForm.get('organizationName')?.value.trim(),
      organizationType: this.organizationForm.get('organizationType')?.value,
      organizationId: this.organizationForm.get('organizationId')?.value?.trim() || undefined,
      
      // Address
      address: {
        street: this.organizationForm.get('address.street')?.value.trim(),
        city: this.organizationForm.get('address.city')?.value.trim(),
        state: this.organizationForm.get('address.state')?.value.trim(),
        country: this.organizationForm.get('address.country')?.value.trim(),
        postalCode: this.organizationForm.get('address.postalCode')?.value.trim()
      },
      
      // Terms acceptance
      acceptTerms: this.securityForm.get('acceptTerms')?.value
    };

    this.authService.register(registrationData).subscribe({
      next: (response) => {
        this.handleRegistrationSuccess(response);
      },
      error: (error) => {
        this.handleRegistrationError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleRegistrationSuccess(response: any): void {
    this.registrationSuccess.set(true);
    this.notificationService.success('Registration successful! Welcome to BlockTrade.');
    
    // Auto-redirect after a short delay to show success state
    setTimeout(() => {
      this.router.navigate([this.returnUrl]);
    }, 2000);
  }

  private handleRegistrationError(error: any): void {
    const errors: string[] = [];
    
    if (error.error?.details && Array.isArray(error.error.details)) {
      // Handle validation errors from server
      error.error.details.forEach((detail: any) => {
        if (detail.message) {
          errors.push(detail.message);
        }
      });
    } else if (error.message) {
      errors.push(error.message);
    } else {
      // Default error based on status code
      switch (error.status) {
        case 400:
          errors.push('Please check your input and try again.');
          break;
        case 409:
          errors.push('An account with this email or username already exists.');
          break;
        case 422:
          errors.push('Please correct the highlighted fields and try again.');
          break;
        default:
          errors.push('Registration failed. Please try again later.');
      }
    }
    
    this.apiErrors.set(errors);
    this.notificationService.error(errors[0] || 'Registration failed');
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      if (control) {
        control.markAsTouched();
        if (control instanceof FormGroup) {
          this.markFormGroupTouched(control);
        }
      }
    });
  }

  private markAllFormsTouched(): void {
    this.markFormGroupTouched(this.personalInfoForm);
    this.markFormGroupTouched(this.organizationForm);
    this.markFormGroupTouched(this.securityForm);
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.set(!this.hideConfirmPassword());
  }

  onBackToLogin(): void {
    this.router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  // Getter methods for template validation errors
  getFieldError(formGroup: FormGroup, fieldName: string): string | null {
    const control = formGroup.get(fieldName);
    if (control?.touched && control?.errors) {
      const errors = control.errors;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
      if (errors['pattern']) return this.getPatternError(fieldName);
      if (errors['requiredTrue']) return 'You must accept the terms and conditions';
    }
    return null;
  }

  // Helper method for nested form groups
  getNestedFieldError(fieldPath: string): string | null {
    const control = this.organizationForm.get(fieldPath);
    if (control?.touched && control?.errors) {
      const errors = control.errors;
      const fieldName = fieldPath.split('.').pop() || fieldPath;
      
      if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
      if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} cannot exceed ${errors['maxlength'].requiredLength} characters`;
      if (errors['pattern']) return this.getPatternError(fieldName);
      if (errors['requiredTrue']) return 'You must accept the terms and conditions';
    }
    return null;
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      phone: 'Phone Number',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      organizationName: 'Organization Name',
      organizationType: 'Organization Type',
      street: 'Street Address',
      city: 'City',
      state: 'State',
      country: 'Country',
      postalCode: 'Postal Code'
    };
    return labels[fieldName] || fieldName;
  }

  private getPatternError(fieldName: string): string {
    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        return 'Only letters and spaces are allowed';
      case 'phone':
        return 'Please enter a valid phone number';
      case 'username':
        return 'Username can only contain letters, numbers, and underscores';
      case 'password':
        return 'Password must contain uppercase, lowercase, number, and special character';
      case 'postalCode':
        return 'Please enter a valid postal code';
      default:
        return 'Invalid format';
    }
  }

  get passwordMismatchError(): string | null {
    const form = this.securityForm;
    if (form?.touched && form?.errors?.['passwordMismatch']) {
      return 'Passwords do not match';
    }
    return null;
  }

  get canProceedToNext(): boolean {
    return this.getCurrentStepForm().valid;
  }

  get canSubmit(): boolean {
    return this.isAllFormsValid() && !this.isLoading();
  }

  get stepTitles(): string[] {
    return ['Personal Information', 'Organization Details', 'Security Setup'];
  }
}
