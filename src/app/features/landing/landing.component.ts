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
  showConfirmPassword = false;
  isLoading = false;
  message: { type: 'success' | 'error'; text: string } | null = null;
  
  // Registration mode
  isNewOrganization = true;
  
  // Organization types for registration
  registrationOrgTypes = [
    { value: 'bank', label: 'Commercial Bank' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'nbfc', label: 'NBFC (Non-Banking Financial Company)' },
    { value: 'logistics', label: 'Logistics Company' },
    { value: 'insurance', label: 'Insurance Provider' }
  ];
  
  // Country codes for international support
  countryCodes = [
    { value: 'US', label: 'United States' },
    { value: 'GB', label: 'United Kingdom' },
    { value: 'IN', label: 'India' },
    { value: 'SG', label: 'Singapore' },
    { value: 'AE', label: 'United Arab Emirates' },
    { value: 'CN', label: 'China' },
    { value: 'JP', label: 'Japan' },
    { value: 'DE', label: 'Germany' },
    { value: 'FR', label: 'France' }
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
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });

    // Comprehensive registration form based on API documentation
    this.registerForm = this.formBuilder.group({
      // User Information
      username: ['', [
        Validators.required, 
        Validators.minLength(3), 
        Validators.maxLength(30),
        Validators.pattern(/^[a-zA-Z0-9_]+$/)
      ]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [
        Validators.required, 
        Validators.minLength(8),
        Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      ]],
      confirmPassword: ['', Validators.required],
      firstName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(50)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      
      // Organization Information
      organizationName: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(100)]],
      organizationType: ['', Validators.required],
      isNewOrganization: [true],
      
      // For existing organization (conditionally required)
      organizationId: [''],
      
      // For new organization (conditionally required)
      organizationCountryCode: [''],
      organizationAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        postalCode: ['']
      }),
      organizationContactPerson: this.formBuilder.group({
        name: [''],
        email: [''],
        phone: ['']
      }),
      organizationSwiftCode: [''],
      organizationRegistrationNumber: [''],
      organizationLicenseNumber: [''],
      
      // Optional fields
      timezone: [''],
      language: ['en'],
      agreeToMarketing: [false],
      
      // Required acceptance
      acceptTerms: [false, Validators.requiredTrue]
    }, { 
      validators: [
        this.passwordMatchValidator,
        this.organizationFieldsValidator
      ] 
    });

    // Listen to isNewOrganization changes to update validators
    this.registerForm.get('isNewOrganization')?.valueChanges.subscribe(isNew => {
      this.updateOrganizationValidators(isNew);
    });

    // Listen to organizationType changes for specific validations
    this.registerForm.get('organizationType')?.valueChanges.subscribe(type => {
      this.updateTypeSpecificValidators(type);
    });
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

  private organizationFieldsValidator(form: FormGroup) {
    const isNew = form.get('isNewOrganization')?.value;
    const organizationId = form.get('organizationId');
    const countryCode = form.get('organizationCountryCode');
    const address = form.get('organizationAddress');

    if (isNew) {
      // For new organizations, require country code and address
      if (!countryCode?.value) {
        countryCode?.setErrors({ required: true });
      }
      
      const addressGroup = address as FormGroup;
      if (addressGroup) {
        const street = addressGroup.get('street');
        const city = addressGroup.get('city');
        const country = addressGroup.get('country');
        const postalCode = addressGroup.get('postalCode');

        if (!street?.value || !city?.value || !country?.value || !postalCode?.value) {
          return { incompleteAddress: true };
        }
      }
    } else {
      // For existing organizations, require organization ID
      if (!organizationId?.value) {
        organizationId?.setErrors({ required: true });
        return { missingOrgId: true };
      }
    }

    return null;
  }

  private updateOrganizationValidators(isNew: boolean): void {
    const countryCode = this.registerForm.get('organizationCountryCode');
    const address = this.registerForm.get('organizationAddress') as FormGroup;
    const organizationId = this.registerForm.get('organizationId');

    if (isNew) {
      // New organization - require address fields
      countryCode?.setValidators([Validators.required]);
      address?.get('street')?.setValidators([Validators.required]);
      address?.get('city')?.setValidators([Validators.required]);
      address?.get('country')?.setValidators([Validators.required]);
      address?.get('postalCode')?.setValidators([Validators.required]);
      
      // Organization ID not required for new org
      organizationId?.clearValidators();
    } else {
      // Existing organization - require organization ID
      organizationId?.setValidators([Validators.required, Validators.pattern(/^[a-f\d]{24}$/i)]);
      
      // Address fields optional for existing org
      countryCode?.clearValidators();
      address?.get('street')?.clearValidators();
      address?.get('city')?.clearValidators();
      address?.get('country')?.clearValidators();
      address?.get('postalCode')?.clearValidators();
    }

    // Update validation state
    countryCode?.updateValueAndValidity();
    address?.get('street')?.updateValueAndValidity();
    address?.get('city')?.updateValueAndValidity();
    address?.get('country')?.updateValueAndValidity();
    address?.get('postalCode')?.updateValueAndValidity();
    organizationId?.updateValueAndValidity();
  }

  private updateTypeSpecificValidators(orgType: string): void {
    const swiftCode = this.registerForm.get('organizationSwiftCode');
    const licenseNumber = this.registerForm.get('organizationLicenseNumber');

    // SWIFT code typically required for banks
    if (orgType === 'bank') {
      swiftCode?.setValidators([Validators.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)]);
    } else {
      swiftCode?.clearValidators();
    }

    // License number for regulated entities
    if (['nbfc', 'insurance', 'logistics'].includes(orgType)) {
      licenseNumber?.setValidators([Validators.required]);
    } else {
      licenseNumber?.clearValidators();
    }

    swiftCode?.updateValueAndValidity();
    licenseNumber?.updateValueAndValidity();
  }

  private resetForms(): void {
    this.loginForm.reset();
    this.registerForm.reset({
      isNewOrganization: true,
      language: 'en',
      acceptTerms: false,
      agreeToMarketing: false
    });
    this.showPassword = false;
    this.showConfirmPassword = false;
    this.isLoading = false;
    this.isNewOrganization = true;
  }

  isFieldInvalid(fieldName: string, form: FormGroup = this.loginForm): boolean {
    const field = form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string, form: FormGroup = this.loginForm): string | null {
    const field = form.get(fieldName);
    if (!field || !field.errors || !field.touched) return null;

    const errors = field.errors;
    
    if (errors['required']) return `${this.getFieldLabel(fieldName)} is required`;
    if (errors['email']) return 'Please enter a valid email address';
    if (errors['minlength']) return `${this.getFieldLabel(fieldName)} must be at least ${errors['minlength'].requiredLength} characters`;
    if (errors['maxlength']) return `${this.getFieldLabel(fieldName)} must not exceed ${errors['maxlength'].requiredLength} characters`;
    if (errors['pattern']) {
      if (fieldName === 'username') return 'Username can only contain letters, numbers, and underscores';
      if (fieldName === 'password') return 'Password must contain uppercase, lowercase, number, and special character';
      if (fieldName === 'phone') return 'Please enter a valid phone number (e.g., +1-555-0123)';
      if (fieldName === 'organizationSwiftCode') return 'Invalid SWIFT/BIC code format';
    }
    if (errors['passwordMismatch']) return 'Passwords do not match';

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      username: 'Username',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone Number',
      organizationName: 'Organization Name',
      organizationType: 'Organization Type',
      organizationId: 'Organization ID',
      organizationCountryCode: 'Country Code'
    };
    return labels[fieldName] || fieldName;
  }

  togglePassword(field: 'password' | 'confirmPassword' = 'password'): void {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  toggleOrganizationMode(): void {
    this.isNewOrganization = !this.isNewOrganization;
    this.registerForm.patchValue({ isNewOrganization: this.isNewOrganization });
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
            console.log('Login response:', response);
            // Response structure: { success: true, message: string, data: { user, tokens } }
            if (response?.user || response?.data?.user) {
              this.message = { type: 'success', text: 'Login successful! Redirecting to dashboard...' };
              
              // Wait for auth data to be fully saved before navigating
              setTimeout(() => {
                this.isLoading = false;
                this.closeAuthModal();
                // Navigate to dashboard
                this.router.navigate(['/dashboard']);
              }, 1200); // Increased delay to ensure data is persisted
            } else {
              this.isLoading = false;
              this.message = { 
                type: 'error', 
                text: 'Invalid response from server. Please try again.' 
              };
            }
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
    // Mark all fields as touched to show validation errors
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
      
      // Also mark nested form groups
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });

    if (this.registerForm.valid) {
      this.isLoading = true;
      this.message = null;
      
      const formData = this.registerForm.value;
      
      // Build registration data according to API specification
      const registrationData: any = {
        // Required fields
        username: formData.username?.trim(),
        email: formData.email?.trim().toLowerCase(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        firstName: formData.firstName?.trim(),
        lastName: formData.lastName?.trim(),
        organizationName: formData.organizationName?.trim(),
        organizationType: formData.organizationType,
        isNewOrganization: formData.isNewOrganization,
        phone: formData.phone?.trim(),
        acceptTerms: formData.acceptTerms
      };

      // Add new organization fields
      if (formData.isNewOrganization) {
        registrationData.organizationCountryCode = formData.organizationCountryCode;
        
        // Organization address (required for new org)
        if (formData.organizationAddress) {
          registrationData.organizationAddress = {
            street: formData.organizationAddress.street?.trim(),
            city: formData.organizationAddress.city?.trim(),
            state: formData.organizationAddress.state?.trim(),
            country: formData.organizationAddress.country?.trim(),
            postalCode: formData.organizationAddress.postalCode?.trim()
          };
        }

        // Organization contact person
        if (formData.organizationContactPerson?.name || formData.organizationContactPerson?.email) {
          registrationData.organizationContactPerson = {
            name: formData.organizationContactPerson.name?.trim() || `${formData.firstName} ${formData.lastName}`,
            email: formData.organizationContactPerson.email?.trim() || formData.email,
            phone: formData.organizationContactPerson.phone?.trim() || formData.phone
          };
        }

        // Optional organization fields
        if (formData.organizationSwiftCode) {
          registrationData.organizationSwiftCode = formData.organizationSwiftCode.trim().toUpperCase();
        }
        if (formData.organizationRegistrationNumber) {
          registrationData.organizationRegistrationNumber = formData.organizationRegistrationNumber.trim();
        }
        if (formData.organizationLicenseNumber) {
          registrationData.organizationLicenseNumber = formData.organizationLicenseNumber.trim();
        }
      } else {
        // Existing organization - require organization ID
        if (formData.organizationId) {
          registrationData.organizationId = formData.organizationId.trim();
        } else {
          this.isLoading = false;
          this.message = {
            type: 'error',
            text: 'Organization ID is required to join an existing organization'
          };
          return;
        }
      }

      // Optional fields
      if (formData.timezone) {
        registrationData.timezone = formData.timezone;
      }
      if (formData.language) {
        registrationData.language = formData.language;
      }
      if (formData.agreeToMarketing) {
        registrationData.agreeToMarketing = formData.agreeToMarketing;
      }

      console.log('Registration data:', registrationData);
      
      this.authService.register(registrationData)
        .subscribe({
          next: (response: any) => {
            console.log('Registration response:', response);
            
            // Response structure: { success: true, message: string, data: { user, tokens, organizationInfo } }
            if (response?.user  ) {
              const user = response.user ;
              const orgInfo = response.organizationInfo;

              // Success message with role information
              let successMessage = 'Registration successful! ';
              if (user?.role) {
                const roleName = this.formatRoleName(user.role);
                successMessage += `You have been assigned the role of ${roleName}. `;
              }
              if (orgInfo?.isNewOrganization) {
                successMessage += 'Your organization has been created. ';
              }
              successMessage += 'Redirecting to onboarding...';
              
              this.message = { 
                type: 'success', 
                text: successMessage
              };
              
              // Wait for auth data to be fully saved before navigating
              setTimeout(() => {
                this.isLoading = false;
                this.closeAuthModal();
                // Navigate to onboarding for new users
                this.router.navigate(['/onboarding']);
              }, 1200); // Increased delay to ensure data is persisted
            } else {
              this.isLoading = false;
              this.message = { 
                type: 'error', 
                text: 'Invalid response from server. Please try again.' 
              };
            }
          },
          error: (error: any) => {
            this.isLoading = false;
            console.error('Registration error:', error);
            
            // Handle different error types based on API documentation
            let errorMessage = 'Registration failed. ';
            
            if (error.error) {
              const errorData = error.error;
              
              // Validation errors (400)
              if (errorData.error?.code === 'VALIDATION_ERROR') {
                const field = errorData.error.details?.field;
                const message = errorData.error.details?.message;
                errorMessage = message || errorData.message || 'Validation failed. Please check your input.';
                
                // Highlight the specific field with error
                if (field) {
                  const control = this.registerForm.get(field);
                  if (control) {
                    control.setErrors({ serverError: message });
                    control.markAsTouched();
                  }
                }
              }
              // Duplicate errors (409)
              else if (errorData.error?.code === 'DUPLICATE_ERROR') {
                const field = errorData.error.details?.field;
                const value = errorData.error.details?.value;
                
                if (field === 'email') {
                  errorMessage = `The email address "${value}" is already registered. Please use a different email or try logging in.`;
                } else if (field === 'username') {
                  errorMessage = `The username "${value}" is already taken. Please choose a different username.`;
                } else if (field === 'organizationName') {
                  errorMessage = `An organization with the name "${value}" already exists.`;
                } else {
                  errorMessage = errorData.message || 'This information is already registered in the system.';
                }
                
                // Highlight the duplicate field
                if (field) {
                  const control = this.registerForm.get(field);
                  if (control) {
                    control.setErrors({ duplicate: true });
                    control.markAsTouched();
                  }
                }
              }
              // Organization not found (404)
              else if (error.status === 404) {
                errorMessage = errorData.message || 'Organization not found. Please check the organization ID or create a new organization.';
                
                const orgIdControl = this.registerForm.get('organizationId');
                if (orgIdControl) {
                  orgIdControl.setErrors({ notFound: true });
                  orgIdControl.markAsTouched();
                }
              }
              // Generic error message from server
              else if (errorData.message) {
                errorMessage = errorData.message;
              }
            }
            
            this.message = { 
              type: 'error', 
              text: errorMessage
            };

            // Scroll to top to show error message
            setTimeout(() => {
              const modalContent = document.querySelector('.auth-modal-content');
              if (modalContent) {
                modalContent.scrollTop = 0;
              }
            }, 100);
          }
        });
    } else {
      // Form is invalid - show validation message
      this.message = {
        type: 'error',
        text: 'Please fill in all required fields correctly before submitting.'
      };

      // Find first invalid field and focus
      const firstInvalidControl = this.findFirstInvalidControl();
      if (firstInvalidControl) {
        const element = document.querySelector(`[formControlName="${firstInvalidControl}"]`) as HTMLElement;
        if (element) {
          element.focus();
        }
      }

      // Scroll to top to show error message
      setTimeout(() => {
        const modalContent = document.querySelector('.auth-modal-content');
        if (modalContent) {
          modalContent.scrollTop = 0;
        }
      }, 100);
    }
  }

  private formatRoleName(role: string): string {
    // Format role names for display
    const roleMap: { [key: string]: string } = {
      'bank_admin': 'Bank Administrator',
      'bank_officer': 'Bank Officer',
      'corporate_admin': 'Corporate Administrator',
      'corporate_user': 'Corporate User',
      'nbfc_admin': 'NBFC Administrator',
      'nbfc_user': 'NBFC User',
      'logistics_admin': 'Logistics Administrator',
      'logistics_user': 'Logistics User',
      'insurance_admin': 'Insurance Administrator',
      'insurance_user': 'Insurance User'
    };
    return roleMap[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private findFirstInvalidControl(): string | null {
    const controls = this.registerForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        return name;
      }
    }
    return null;
  }

  private getDashboardRoute(role: string): string {
    // All users go to the same dashboard, which will show role-specific content
    return '/dashboard';
  }

  getPasswordStrength(): string {
    const password = this.registerForm.get('password')?.value || '';
    
    if (!password) return 'weak';
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    
    // Character type checks
    if (/[a-z]/.test(password)) strength++; // lowercase
    if (/[A-Z]/.test(password)) strength++; // uppercase
    if (/[0-9]/.test(password)) strength++; // numbers
    if (/[@$!%*?&]/.test(password)) strength++; // special characters
    
    // Return strength class
    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
  }

  getPasswordStrengthText(): string {
    const strength = this.getPasswordStrength();
    const texts: { [key: string]: string } = {
      'weak': 'Weak Password',
      'medium': 'Medium Password',
      'strong': 'Strong Password'
    };
    return texts[strength] || 'Weak Password';
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
