import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';
import { MESSAGES } from '../../../shared/constants/messages.constants';
import { APP_CONFIG } from '../../../shared/constants/app-config.constants';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css'
})
export class ForgotPasswordComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  // Signals for reactive state management
  isLoading = signal(false);
  emailSent = signal(false);
  apiErrors = signal<string[]>([]);
  
  forgotPasswordForm!: FormGroup;

  // Constants for template
  readonly MESSAGES = MESSAGES;
  readonly APP_NAME = APP_CONFIG.APP_NAME;

  ngOnInit(): void {
    this.initializeForm();
    this.checkIfAlreadyAuthenticated();
  }

  private initializeForm(): void {
    this.forgotPasswordForm = this.formBuilder.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(APP_CONFIG.VALIDATION.EMAIL_PATTERN)
      ]]
    });
  }

  private checkIfAlreadyAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit(): void {
    if (this.forgotPasswordForm.valid && !this.isLoading()) {
      this.performForgotPassword();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performForgotPassword(): void {
    this.isLoading.set(true);
    this.apiErrors.set([]);

    const email = this.forgotPasswordForm.get('email')?.value.trim().toLowerCase();

    this.authService.forgotPassword({ email }).subscribe({
      next: (response) => {
        this.handleForgotPasswordSuccess();
      },
      error: (error) => {
        this.handleForgotPasswordError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleForgotPasswordSuccess(): void {
    this.emailSent.set(true);
    this.notificationService.success('Password reset link sent to your email address.');
  }

  private handleForgotPasswordError(error: any): void {
    const errors: string[] = [];
    
    if (error.error?.details && Array.isArray(error.error.details)) {
      error.error.details.forEach((detail: any) => {
        if (detail.message) {
          errors.push(detail.message);
        }
      });
    } else if (error.message) {
      errors.push(error.message);
    } else {
      switch (error.status) {
        case 400:
          errors.push('Please enter a valid email address.');
          break;
        case 404:
          errors.push('No account found with this email address.');
          break;
        case 429:
          errors.push('Too many password reset requests. Please try again later.');
          break;
        case 500:
          errors.push('Server error. Please try again later.');
          break;
        default:
          errors.push('Failed to send password reset email. Please try again.');
      }
    }
    
    this.apiErrors.set(errors);
    this.notificationService.error(errors[0] || 'Password reset failed');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.forgotPasswordForm.controls).forEach(key => {
      const control = this.forgotPasswordForm.get(key);
      control?.markAsTouched();
    });
  }

  onBackToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  onResendEmail(): void {
    if (this.forgotPasswordForm.valid) {
      this.emailSent.set(false);
      this.performForgotPassword();
    }
  }

  // Getter methods for template
  get emailError(): string | null {
    const control = this.forgotPasswordForm.get('email');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Email address is required';
      if (control.errors['email'] || control.errors['pattern']) return 'Please enter a valid email address';
    }
    return null;
  }

  get canSubmit(): boolean {
    return this.forgotPasswordForm.valid && !this.isLoading();
  }
}
