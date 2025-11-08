import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AuthService } from '../../../core/services/auth.service';
import { UserLogin } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  host: {
    'class': 'auth-page full-width-layout'
  }
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  loginAttempts = 0;
  maxAttempts = 3;
  message: { type: 'success' | 'error'; text: string } | null = null;
  returnUrl = '/dashboard';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.getReturnUrl();
    this.checkIfAlreadyAuthenticated();
  }

  private initializeForm(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      this.message = null;
      this.performLogin();
    } else {
      this.markFormGroupTouched();
    }
  }

  private performLogin(): void {
    const loginData: UserLogin = {
      username: this.loginForm.get('email')?.value.trim(),
      password: this.loginForm.get('password')?.value,
      rememberMe: this.loginForm.get('rememberMe')?.value || false
    };

    this.authService.login(loginData).subscribe({
      next: (response: any) => {
        // Response structure: { success: true, message: string, data: { user, tokens } }
        if (response?.success || response?.data?.user) {
          this.handleLoginSuccess();
        } else {
          this.handleLoginError({ error: { message: 'Invalid response from server' } });
        }
      },
      error: (error: any) => {
        this.handleLoginError(error);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  private handleLoginSuccess(): void {
    this.loginAttempts = 0;
    this.message = { type: 'success', text: 'Login successful! Redirecting to dashboard...' };
    
    // Short delay for user feedback, then navigate
    setTimeout(() => {
      this.router.navigate([this.returnUrl]);
    }, 800);
  }

  private handleLoginError(error: any): void {
    this.loginAttempts++;
    
    let errorMessage = 'Login failed. Please try again.';
    
    if (error.status === 401) {
      errorMessage = 'Invalid email or password.';
    } else if (error.status === 403) {
      errorMessage = 'Account is locked. Please contact support.';
    } else if (error.status === 429) {
      errorMessage = 'Too many login attempts. Please try again later.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    this.message = { type: 'error', text: errorMessage };
    
    // Reset password field
    this.loginForm.get('password')?.setValue('');
    
    if (this.loginAttempts >= this.maxAttempts) {
      this.loginForm.disable();
      this.message = { type: 'error', text: 'Account temporarily locked due to multiple failed attempts.' };
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  signInWithGoogle(): void {
    // Implement Google OAuth
    console.log('Google Sign In');
  }

  signInWithMicrosoft(): void {
    // Implement Microsoft OAuth
    console.log('Microsoft Sign In');
  }
}
