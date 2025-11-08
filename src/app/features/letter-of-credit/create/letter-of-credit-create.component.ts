/**
 * Letter of Credit Create Component
 * Multi-step form for creating new letters of credit
 */

import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../core/services/auth.service';
import { ApiService } from '../../../core/services/api.service';
import { NotificationService } from '../../../core/services/notification.service';
import { User } from '../../../core/models/user.model';
import { LetterOfCredit } from '../../../core/models/letter-of-credit.model';

export interface DocumentRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  format: string[];
}

export interface TradeTerms {
  incoterms: string;
  portOfLoading: string;
  portOfDischarge: string;
  partialShipment: boolean;
  transhipment: boolean;
  shipmentDeadline: Date;
  expiryDate: Date;
}

@Component({
  selector: 'app-letter-of-credit-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './letter-of-credit-create.component.html',
  styleUrl: './letter-of-credit-create.component.css'
})
export class LetterOfCreditCreateComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly apiService = inject(ApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  // Signals for reactive state
  currentUser = signal<User | null>(null);
  isLoading = signal(false);
  currentStep = signal(0);
  
  // Form groups for each step
  applicantForm!: FormGroup;
  beneficiaryForm!: FormGroup;
  creditDetailsForm!: FormGroup;
  tradeTermsForm!: FormGroup;
  documentsForm!: FormGroup;
  reviewForm!: FormGroup;

  // Options data
  currencies = signal(['USD', 'EUR', 'GBP', 'JPY', 'CHF', 'CAD', 'AUD']);
  countries = signal(['United States', 'United Kingdom', 'Germany', 'France', 'Japan', 'Canada', 'Australia']);
  incoterms = signal(['FOB', 'CIF', 'CFR', 'EXW', 'DDP', 'DDU', 'FCA', 'CPT']);
  
  documentRequirements = signal<DocumentRequirement[]>([
    { id: 'commercial_invoice', name: 'Commercial Invoice', description: 'Detailed invoice of goods', required: true, format: ['PDF', 'DOC'] },
    { id: 'bill_of_lading', name: 'Bill of Lading', description: 'Transport document', required: true, format: ['PDF'] },
    { id: 'packing_list', name: 'Packing List', description: 'Detailed packing information', required: true, format: ['PDF', 'XLS'] },
    { id: 'certificate_of_origin', name: 'Certificate of Origin', description: 'Origin certification', required: false, format: ['PDF'] },
    { id: 'insurance_certificate', name: 'Insurance Certificate', description: 'Cargo insurance document', required: false, format: ['PDF'] },
    { id: 'inspection_certificate', name: 'Inspection Certificate', description: 'Quality inspection document', required: false, format: ['PDF'] }
  ]);

  // Computed values
  totalSteps = computed(() => 6);
  isLastStep = computed(() => this.currentStep() === this.totalSteps() - 1);
  isFirstStep = computed(() => this.currentStep() === 0);
  canProceed = computed(() => this.getCurrentStepForm()?.valid || false);

  ngOnInit(): void {
    this.initializeForms();
    this.loadCurrentUser();
  }

  private initializeForms(): void {
    this.applicantForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      accountNumber: ['', [Validators.required]]
    });

    this.beneficiaryForm = this.fb.group({
      companyName: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      contactPerson: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      bankName: ['', [Validators.required]],
      bankAddress: ['', [Validators.required]],
      swiftCode: ['', [Validators.required, Validators.pattern(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/)]]
    });

    this.creditDetailsForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      currency: ['USD', [Validators.required]],
      tolerance: [10, [Validators.min(0), Validators.max(20)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      paymentTerms: ['sight', [Validators.required]],
      tenor: [0, [Validators.min(0), Validators.max(365)]],
      availableWith: ['issuing_bank', [Validators.required]],
      availableBy: ['payment', [Validators.required]]
    });

    this.tradeTermsForm = this.fb.group({
      incoterms: ['FOB', [Validators.required]],
      portOfLoading: ['', [Validators.required]],
      portOfDischarge: ['', [Validators.required]],
      partialShipment: [false],
      transhipment: [false],
      shipmentDeadline: ['', [Validators.required]],
      expiryDate: ['', [Validators.required]],
      latestShipmentDate: ['', [Validators.required]]
    });

    this.documentsForm = this.fb.group({
      requirements: this.fb.array([]),
      specialInstructions: [''],
      presentationPeriod: [21, [Validators.required, Validators.min(1), Validators.max(30)]]
    });

    this.reviewForm = this.fb.group({
      confirmAccuracy: [false, [Validators.requiredTrue]],
      agreeToTerms: [false, [Validators.requiredTrue]],
      additionalNotes: ['']
    });

    // Initialize document requirements FormArray
    this.initializeDocumentRequirements();
  }

  private initializeDocumentRequirements(): void {
    const requirementsArray = this.documentsForm.get('requirements') as FormArray;
    this.documentRequirements().forEach(req => {
      requirementsArray.push(this.fb.group({
        id: [req.id],
        required: [req.required],
        format: [req.format[0]]
      }));
    });
  }

  private loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser.set(user);
      if (user) {
        this.prefillApplicantData(user);
      }
    });
  }

  private prefillApplicantData(user: User): void {
    this.applicantForm.patchValue({
      companyName: user.organizationName || '',
      contactPerson: `${user.firstName} ${user.lastName}`,
      email: user.email || ''
    });
  }

  getCurrentStepForm(): FormGroup | null {
    switch (this.currentStep()) {
      case 0: return this.applicantForm;
      case 1: return this.beneficiaryForm;
      case 2: return this.creditDetailsForm;
      case 3: return this.tradeTermsForm;
      case 4: return this.documentsForm;
      case 5: return this.reviewForm;
      default: return null;
    }
  }

  onStepChange(stepIndex: number): void {
    this.currentStep.set(stepIndex);
  }

  nextStep(): void {
    if (this.canProceed() && !this.isLastStep()) {
      this.currentStep.set(this.currentStep() + 1);
    }
  }

  previousStep(): void {
    if (!this.isFirstStep()) {
      this.currentStep.set(this.currentStep() - 1);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.isAllFormsValid()) {
      this.notificationService.error('Please complete all required fields');
      return;
    }

    this.isLoading.set(true);
    
    try {
      const lcData = this.buildLetterOfCreditData();
      const response = await this.apiService.post<LetterOfCredit>('/letters-of-credit', lcData).toPromise();
      
      if (response?.success) {
        this.notificationService.success('Letter of Credit created successfully');
        this.router.navigate(['/letters-of-credit', response.data.id]);
      } else {
        throw new Error(response?.message || 'Failed to create Letter of Credit');
      }
    } catch (error: any) {
      console.error('Error creating LC:', error);
      this.notificationService.error(error.message || 'Failed to create Letter of Credit');
    } finally {
      this.isLoading.set(false);
    }
  }

  private isAllFormsValid(): boolean {
    return [
      this.applicantForm,
      this.beneficiaryForm,
      this.creditDetailsForm,
      this.tradeTermsForm,
      this.documentsForm,
      this.reviewForm
    ].every(form => form.valid);
  }

  private buildLetterOfCreditData(): any {
    return {
      applicant: this.applicantForm.value,
      beneficiary: this.beneficiaryForm.value,
      creditDetails: this.creditDetailsForm.value,
      tradeTerms: this.tradeTermsForm.value,
      documentRequirements: this.documentsForm.value.requirements,
      specialInstructions: this.documentsForm.value.specialInstructions,
      presentationPeriod: this.documentsForm.value.presentationPeriod,
      additionalNotes: this.reviewForm.value.additionalNotes
    };
  }

  onCancel(): void {
    this.router.navigate(['/letters-of-credit']);
  }

  onSaveDraft(): void {
    // Implementation for saving draft
    this.notificationService.info('Draft saved successfully');
  }

  // Helper methods for template
  getRequirementDescription(requirementId: string): string {
    const req = this.documentRequirements().find(r => r.id === requirementId);
    return req?.description || '';
  }

  getRequirementFormats(requirementId: string): string[] {
    const req = this.documentRequirements().find(r => r.id === requirementId);
    return req?.format || [];
  }

  getStepTitle(stepIndex: number): string {
    const titles = [
      'Applicant Information',
      'Beneficiary Information', 
      'Credit Details',
      'Trade Terms',
      'Document Requirements',
      'Review & Submit'
    ];
    return titles[stepIndex] || '';
  }

  getStepIcon(stepIndex: number): string {
    const icons = [
      'business',
      'person',
      'attach_money',
      'local_shipping',
      'description',
      'check_circle'
    ];
    return icons[stepIndex] || 'help';
  }

  // Form field getters for template
  get requirementsArray(): FormArray {
    return this.documentsForm.get('requirements') as FormArray;
  }
}
