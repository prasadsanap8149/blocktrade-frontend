/**
 * Core User Models and Interfaces
 * Type definitions for user-related data structures
 */

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  permissions: Permission[];
  phone?: string;
  bio?: string;
  profilePicture?: string;
  address?: Address;
  timezone?: string;
  language?: string;
  isActive: boolean;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  lastLogin?: Date;
  mfaEnabled: boolean;
  notifications?: NotificationPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRegistration {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  organizationId?: string;
  organizationName: string;
  organizationType: OrganizationType;
  phone?: string;
  address?: Address;
  acceptTerms: boolean;
}

export interface UserLogin {
  username: string;
  password: string;
  mfaCode?: string;
  rememberMe?: boolean;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  bio?: string;
  profilePicture?: string;
  timezone?: string;
  language?: string;
  address?: Address;
  notifications?: NotificationPreferences;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPassword {
  email: string;
}

export interface ResetPassword {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: AuthTokens;
  };
}

export interface UserJourney {
  id: string;
  userId: string;
  currentStep: number;
  totalSteps: number;
  stepsCompleted: number[];
  stepData: Record<number, any>;
  isCompleted: boolean;
  completedAt?: Date;
  organizationType: OrganizationType;
  startedAt: Date;
  updatedAt: Date;
}

export interface JourneyStep {
  stepNumber: number;
  title: string;
  description: string;
  isRequired: boolean;
  isCompleted: boolean;
  data?: any;
  validationRules?: ValidationRule[];
}

export interface ValidationRule {
  field: string;
  rules: string[];
  message: string;
}

export interface UserAssignment {
  id: string;
  userId: string;
  roleId: string;
  organizationId: string;
  assignedBy: string;
  assignedAt: Date;
  expiresAt?: Date;
  isTemporary: boolean;
  isActive: boolean;
  metadata?: Record<string, any>;
  restrictions?: RoleRestriction[];
}

export interface RoleRestriction {
  type: RestrictionType;
  value: any;
  description: string;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  marketing: boolean;
  securityAlerts: boolean;
  systemUpdates: boolean;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  registrationNumber: string;
  address: Address;
  contactPerson: ContactPerson;
  kycStatus: KYCStatus;
  verificationDocuments: Document[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
  designation: string;
}

export interface Document {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  hash: string;
  uploadedBy: string;
  uploadedAt: Date;
  verificationStatus: VerificationStatus;
}

export enum UserRole {
  // Platform Roles
  PLATFORM_SUPER_ADMIN = 'platform_super_admin',
  PLATFORM_ADMIN = 'platform_admin',
  PLATFORM_SUPPORT = 'platform_support',
  
  // Organization Roles
  ORGANIZATION_SUPER_ADMIN = 'organization_super_admin',
  ORGANIZATION_ADMIN = 'organization_admin',
  ORGANIZATION_MANAGER = 'organization_manager',
  ORGANIZATION_USER = 'organization_user',
  ORGANIZATION_VIEWER = 'organization_viewer',
  
  // Bank Roles
  BANK_ADMIN = 'bank_admin',
  BANK_OFFICER = 'bank_officer',
  BANK_SPECIALIST = 'bank_specialist',
  
  // Corporate Roles
  CORPORATE_ADMIN = 'corporate_admin',
  CORPORATE_MANAGER = 'corporate_manager',
  CORPORATE_USER = 'corporate_user',
  
  // NBFC Roles
  NBFC_ADMIN = 'nbfc_admin',
  NBFC_MANAGER = 'nbfc_manager',
  NBFC_USER = 'nbfc_user',
  
  // Logistics Roles
  LOGISTICS_ADMIN = 'logistics_admin',
  LOGISTICS_MANAGER = 'logistics_manager',
  LOGISTICS_USER = 'logistics_user',
  
  // Insurance Roles
  INSURANCE_ADMIN = 'insurance_admin',
  INSURANCE_MANAGER = 'insurance_manager',
  INSURANCE_USER = 'insurance_user'
}

export enum OrganizationType {
  BANK = 'bank',
  NBFC = 'nbfc',
  CORPORATE = 'corporate',
  LOGISTICS = 'logistics',
  INSURANCE = 'insurance'
}

export enum Permission {
  // Platform Permissions
  PLATFORM_FULL_ACCESS = 'platform:full_access',
  PLATFORM_USER_MANAGE = 'platform:user_manage',
  PLATFORM_ORG_MANAGE = 'platform:org_manage',
  PLATFORM_ROLE_MANAGE = 'platform:role_manage',
  PLATFORM_SUPPORT = 'platform:support',
  PLATFORM_MONITORING = 'platform:monitoring',
  
  // Organization Permissions
  ORG_FULL_ACCESS = 'org:full_access',
  ORG_USER_MANAGE = 'org:user_manage',
  ORG_ROLE_ASSIGN = 'org:role_assign',
  ORG_USER_VIEW = 'org:user_view',
  
  // Business Permissions
  BUSINESS_MANAGE = 'business:manage',
  BUSINESS_APPROVE = 'business:approve',
  BUSINESS_CREATE = 'business:create',
  BUSINESS_VIEW = 'business:view',
  
  // Letter of Credit Permissions
  LC_CREATE = 'lc:create',
  LC_APPROVE = 'lc:approve',
  LC_VIEW = 'lc:view',
  LC_EDIT = 'lc:edit',
  LC_DELETE = 'lc:delete',
  
  // Document Permissions
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_VERIFY = 'document:verify',
  DOCUMENT_VIEW = 'document:view',
  DOCUMENT_MANAGE = 'document:manage',
  
  // Payment Permissions
  PAYMENT_PROCESS = 'payment:process',
  PAYMENT_VIEW = 'payment:view',
  PAYMENT_APPROVE = 'payment:approve',
  
  // Compliance Permissions
  COMPLIANCE_MANAGE = 'compliance:manage',
  KYC_VERIFY = 'kyc:verify',
  KYC_VIEW = 'kyc:view',
  AUDIT_ACCESS = 'audit:access',
  
  // Reporting Permissions
  REPORT_VIEW = 'report:view',
  REPORT_CREATE = 'report:create',
  REPORT_ADMIN = 'report:admin',
  ANALYTICS_VIEW = 'analytics:view',
  
  // User Management Permissions
  USER_MANAGE = 'user:manage',
  USER_CREATE = 'user:create',
  USER_VIEW = 'user:view',
  
  // Role Management Permissions
  ROLE_CREATE = 'role:create',
  ROLE_ASSIGN = 'role:assign',
  ROLE_VIEW = 'role:view'
}

export enum KYCStatus {
  PENDING = 'pending',
  IN_REVIEW = 'in_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum DocumentType {
  INCORPORATION_CERTIFICATE = 'incorporation_certificate',
  TAX_CERTIFICATE = 'tax_certificate',
  BANK_STATEMENT = 'bank_statement',
  COMMERCIAL_INVOICE = 'commercial_invoice',
  BILL_OF_LADING = 'bill_of_lading',
  PACKING_LIST = 'packing_list',
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin',
  INSURANCE_CERTIFICATE = 'insurance_certificate'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

// Additional types
export type RoleLevel = 
  | 'platform' 
  | 'organization_super' 
  | 'organization_admin' 
  | 'organization_standard' 
  | 'entity_specific';

export type RoleCategory = 
  | 'admin' 
  | 'manager' 
  | 'user' 
  | 'viewer' 
  | 'specialist' 
  | 'support';

export type RestrictionType = 
  | 'time_based' 
  | 'ip_based' 
  | 'feature_based' 
  | 'amount_based' 
  | 'department_based';

// Default role mappings for auto-assignment
export const DEFAULT_ROLE_MAPPING: Record<OrganizationType, { admin: UserRole; user: UserRole }> = {
  [OrganizationType.BANK]: {
    admin: UserRole.BANK_ADMIN,
    user: UserRole.BANK_OFFICER
  },
  [OrganizationType.CORPORATE]: {
    admin: UserRole.CORPORATE_ADMIN,
    user: UserRole.CORPORATE_USER
  },
  [OrganizationType.NBFC]: {
    admin: UserRole.NBFC_ADMIN,
    user: UserRole.NBFC_USER
  },
  [OrganizationType.LOGISTICS]: {
    admin: UserRole.LOGISTICS_ADMIN,
    user: UserRole.LOGISTICS_USER
  },
  [OrganizationType.INSURANCE]: {
    admin: UserRole.INSURANCE_ADMIN,
    user: UserRole.INSURANCE_USER
  }
};

// Journey step configuration
export const JOURNEY_STEP_CONFIG: Record<number, Omit<JourneyStep, 'isCompleted' | 'data'>> = {
  1: {
    stepNumber: 1,
    title: 'Organization Setup',
    description: 'Set up your role and department within your organization',
    isRequired: true,
    validationRules: [
      {
        field: 'organizationRole',
        rules: ['required'],
        message: 'Organization role is required'
      },
      {
        field: 'department',
        rules: ['required'],
        message: 'Department is required'
      }
    ]
  },
  2: {
    stepNumber: 2,
    title: 'Profile Completion',
    description: 'Complete your personal profile information',
    isRequired: true,
    validationRules: [
      {
        field: 'firstName',
        rules: ['required'],
        message: 'First name is required'
      },
      {
        field: 'lastName',
        rules: ['required'],
        message: 'Last name is required'
      },
      {
        field: 'phone',
        rules: ['required', 'phone'],
        message: 'Valid phone number is required'
      }
    ]
  },
  3: {
    stepNumber: 3,
    title: 'Security Setup',
    description: 'Configure your security settings and preferences',
    isRequired: true,
    validationRules: [
      {
        field: 'passwordConfirmed',
        rules: ['required'],
        message: 'Password confirmation is required'
      }
    ]
  },
  4: {
    stepNumber: 4,
    title: 'Preferences Setup',
    description: 'Set up your notification and display preferences',
    isRequired: false,
    validationRules: []
  },
  5: {
    stepNumber: 5,
    title: 'Training Completion',
    description: 'Complete required training modules and compliance acknowledgments',
    isRequired: true,
    validationRules: [
      {
        field: 'complianceAcknowledgment',
        rules: ['required'],
        message: 'Compliance acknowledgment is required'
      }
    ]
  }
};
