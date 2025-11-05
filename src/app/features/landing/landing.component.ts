import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
  host: {
    'class': 'landing-page full-width-layout'
  }
})
export class LandingComponent implements OnInit {
  mobileMenuOpen = false;
  showDemoModal = false;
  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';
  
  // Form properties
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  showPassword = false;
  isLoading = false;
  message: { type: 'success' | 'error'; text: string } | null = null;
  
  // Organization types for registration
  registrationOrgTypes = [
    { value: 'bank', label: 'Commercial Bank' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'nbfc', label: 'NBFC' },
    { value: 'logistics', label: 'Logistics Company' },
    { value: 'insurance', label: 'Insurance Provider' },
    { value: 'financial', label: 'Financial Institution' }
  ];
  
  stats = {
    totalTransactions: '50,000',
    totalVolume: '2.5',
    activeUsers: '1,200',
    partneredBanks: '150'
  };

  organizationTypes = [
    {
      type: 'bank',
      icon: '🏛️',
      title: 'Commercial Banks',
      description: 'Streamline Letter of Credit operations with automated workflows and enhanced security.',
      features: [
        'Automated LC processing',
        'Multi-signature approvals',
        'Real-time transaction tracking',
        'Regulatory compliance automation',
        'Risk assessment tools'
      ]
    },
    {
      type: 'corporate',
      icon: '🏢',
      title: 'Corporate Clients',
      description: 'Simplify international trade with transparent and efficient LC management.',
      features: [
        'Trade finance dashboard',
        'Document management',
        'Payment tracking',
        'Supplier integration',
        'Automated reporting'
      ]
    },
    {
      type: 'nbfc',
      icon: '🏦',
      title: 'NBFCs',
      description: 'Specialized financial services and LC support for non-banking financial companies.',
      features: [
        'Trade financing',
        'LC processing',
        'Credit assessment',
        'Portfolio management',
        'Risk mitigation'
      ]
    },
    {
      type: 'logistics',
      icon: '🚚',
      title: 'Logistics Partners',
      description: 'End-to-end shipment and document management for logistics companies.',
      features: [
        'Shipment tracking',
        'Document management',
        'Delivery confirmation',
        'Route optimization',
        'Supply chain visibility'
      ]
    },
    {
      type: 'insurance',
      icon: '🛡️',
      title: 'Insurance Providers',
      description: 'Trade credit insurance and risk mitigation for financial transactions.',
      features: [
        'Risk assessment',
        'Policy management',
        'Claims processing',
        'Coverage analysis',
        'Premium calculation'
      ]
    },
    {
      type: 'financial',
      icon: '�',
      title: 'Financial Institutions',
      description: 'Enhance your trade finance offerings with blockchain-powered infrastructure.',
      features: [
        'White-label solutions',
        'API integrations',
        'Custom workflows',
        'Advanced analytics',
        'Multi-tenant architecture'
      ]
    }
  ];

  processSteps = [
    {
      icon: '📝',
      title: 'Apply & Verify',
      description: 'Submit your trade finance application with required documents and get verified instantly through our automated KYC process.'
    },
    {
      icon: '🔗',
      title: 'Blockchain Processing',
      description: 'Your Letter of Credit is processed on our secure blockchain network with multi-party verification and smart contract execution.'
    },
    {
      icon: '📊',
      title: 'Real-time Tracking',
      description: 'Monitor your transaction status in real-time with complete transparency and automated milestone notifications.'
    },
    {
      icon: '✅',
      title: 'Instant Settlement',
      description: 'Receive instant settlement once all conditions are met, with automatic compliance checks and audit trails.'
    }
  ];

  features = [
    {
      icon: '🔒',
      title: 'Blockchain Security',
      description: 'Immutable transaction records with enterprise-grade encryption'
    },
    {
      icon: '⚡',
      title: 'Real-time Processing',
      description: 'Process Letters of Credit in minutes, not days'
    },
    {
      icon: '🌐',
      title: 'Global Network',
      description: 'Connect with partners worldwide through our unified platform'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'AI-powered insights for better decision making'
    },
    {
      icon: '🔄',
      title: 'Automated Workflows',
      description: 'Reduce manual processes with intelligent automation'
    },
    {
      icon: '�️',
      title: 'Compliance Ready',
      description: 'Built-in compliance with international trade regulations'
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private formBuilder: FormBuilder
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    // Check if user is already authenticated and redirect
    if (this.authService.isAuthenticated()) {
      this.authService.getCurrentUser().subscribe(user => {
        if (user) {
          this.router.navigate([this.getDashboardRoute(user.role)]);
        }
      });
    }
  }

  navigateToLogin(): void {
    this.authMode = 'login';
    this.showAuthModal = true;
  }

  navigateToRegister(): void {
    this.authMode = 'register';
    this.showAuthModal = true;
  }

  closeAuthModal(): void {
    this.showAuthModal = false;
    this.message = null;
    this.resetForms();
  }

  switchAuthMode(mode: 'login' | 'register'): void {
    this.authMode = mode;
    this.message = null;
    this.resetForms();
  }

  private initializeForms(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });

    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      organizationName: ['', Validators.required],
      organizationType: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    }, { validators: this.passwordMatchValidator });
  }

  private passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password?.value !== confirmPassword?.value) {
      confirmPassword?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    if (confirmPassword?.errors?.['passwordMismatch']) {
      delete confirmPassword.errors['passwordMismatch'];
      if (Object.keys(confirmPassword.errors).length === 0) {
        confirmPassword.setErrors(null);
      }
    }
    
    return null;
  }

  private resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset();
    this.showPassword = false;
    this.isLoading = false;
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.loginForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  onLoginSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.message = null;
      
      const formData = this.loginForm.value;
      const loginData = {
        username: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      };
      
      this.authService.login(loginData)
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.message = { type: 'success', text: 'Login successful! Redirecting...' };
            
            setTimeout(() => {
              this.closeAuthModal();
              this.authService.getCurrentUser().subscribe(user => {
                if (user) {
                  this.router.navigate([this.getDashboardRoute(user.role)]);
                }
              });
            }, 1500);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.message = { 
              type: 'error', 
              text: error.error?.message || 'Login failed. Please try again.' 
            };
          }
        });
    }
  }

  onRegisterSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.message = null;
      
      const formData = this.registerForm.value;
      
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName,
        lastName: formData.lastName,
        organizationName: formData.organizationName,
        organizationType: formData.organizationType,
        phone: formData.phone,
        acceptTerms: formData.acceptTerms
      };
      
      this.authService.register(registrationData)
        .subscribe({
          next: (response: any) => {
            this.isLoading = false;
            this.message = { type: 'success', text: 'Registration successful! Redirecting to dashboard...' };
            
            setTimeout(() => {
              this.closeAuthModal();
              this.router.navigate(['/dashboard']);
            }, 2000);
          },
          error: (error: any) => {
            this.isLoading = false;
            this.message = { 
              type: 'error', 
              text: error.error?.message || 'Registration failed. Please try again.' 
            };
          }
        });
    }
  }

  private getDashboardRoute(role: string): string {
    const roleRoutes: { [key: string]: string } = {
      'bank_admin': '/dashboard',
      'bank_officer': '/dashboard',
      'corporate_admin': '/dashboard',
      'corporate_user': '/dashboard',
      'nbfc_admin': '/dashboard',
      'nbfc_user': '/dashboard',
      'logistics_admin': '/dashboard',
      'logistics_user': '/dashboard',
      'insurance_admin': '/dashboard',
      'insurance_user': '/dashboard'
    };
    return roleRoutes[role] || '/dashboard';
  }

  showDemo(): void {
    this.showDemoModal = true;
    // Add smooth scroll to demo section or open demo modal
    setTimeout(() => {
      this.showDemoModal = false;
    }, 5000); // Auto close after 5 seconds
  }

  closeDemoModal(): void {
    this.showDemoModal = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
