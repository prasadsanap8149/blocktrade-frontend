import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
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

import { AuthService } from '../../../core/services/auth.service';
import { MESSAGES } from '../../../shared/constants/messages.constants';
import { APP_CONFIG } from '../../../shared/constants/app-config.constants';
import { UserLogin } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
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
    MatDividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  // Signals for reactive state management
  isLoading = signal(false);
  hidePassword = signal(true);
  loginAttempts = signal(0);
  isAccountLocked = signal(false);
  
  loginForm!: FormGroup;
  returnUrl = '/dashboard';

  // Constants for template
  readonly MESSAGES = MESSAGES;
  readonly APP_NAME = APP_CONFIG.APP_NAME;
  readonly MAX_LOGIN_ATTEMPTS = APP_CONFIG.SECURITY.MAX_LOGIN_ATTEMPTS;

  ngOnInit(): void {
    this.initializeForm();
    this.getReturnUrl();
    this.checkIfAlreadyAuthenticated();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      username: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8)
      ]],
      mfaCode: [''],
      rememberMe: [false]
    });
  }

  private getReturnUrl(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  private checkIfAlreadyAuthenticated(): void {
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading() && !this.isAccountLocked()) {
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performLogin(): void {
    this.isLoading.set(true);

    const loginData: UserLogin = {
      username: this.loginForm.get('username')?.value.trim(),
      password: this.loginForm.get('password')?.value,
      mfaCode: this.loginForm.get('mfaCode')?.value || undefined,
      rememberMe: this.loginForm.get('rememberMe')?.value || false
    };

    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.handleLoginSuccess();
      },
      error: (error) => {
        this.handleLoginError(error);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  private handleLoginSuccess(): void {
    this.loginAttempts.set(0);
    this.router.navigate([this.returnUrl]);
  }

  private handleLoginError(error: any): void {
    const newAttempts = this.loginAttempts() + 1;
    this.loginAttempts.set(newAttempts);

    if (newAttempts >= this.MAX_LOGIN_ATTEMPTS) {
      this.isAccountLocked.set(true);
      this.lockAccount();
    }

    // Reset form password field
    this.loginForm.get('password')?.setValue('');
    this.loginForm.get('mfaCode')?.setValue('');
  }

  private lockAccount(): void {
    this.loginForm.disable();
    
    // Auto-unlock after lockout duration
    setTimeout(() => {
      this.isAccountLocked.set(false);
      this.loginAttempts.set(0);
      this.loginForm.enable();
    }, APP_CONFIG.SECURITY.LOCKOUT_DURATION);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePasswordVisibility(): void {
    this.hidePassword.set(!this.hidePassword());
  }

  onForgotPassword(): void {
    this.router.navigate(['/auth/forgot-password']);
  }

  onCreateAccount(): void {
    this.router.navigate(['/auth/register'], { 
      queryParams: { returnUrl: this.returnUrl } 
    });
  }

  // Getter methods for template
  get usernameError(): string | null {
    const control = this.loginForm.get('username');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return MESSAGES.VALIDATION.EMAIL_REQUIRED;
      if (control.errors['minlength']) return 'Username must be at least 3 characters';
      if (control.errors['maxlength']) return 'Username cannot exceed 50 characters';
    }
    return null;
  }

  get passwordError(): string | null {
    const control = this.loginForm.get('password');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return MESSAGES.VALIDATION.PASSWORD_REQUIRED;
      if (control.errors['minlength']) return MESSAGES.VALIDATION.PASSWORD_MIN_LENGTH;
    }
    return null;
  }

  get remainingAttempts(): number {
    return Math.max(0, this.MAX_LOGIN_ATTEMPTS - this.loginAttempts());
  }

  get canSubmit(): boolean {
    return this.loginForm.valid && !this.isLoading() && !this.isAccountLocked();
  }
}
