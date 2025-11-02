export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  permissions: Permission[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  BANK_ADMIN = 'bank_admin',
  BANK_OFFICER = 'bank_officer',
  CORPORATE_ADMIN = 'corporate_admin',
  CORPORATE_USER = 'corporate_user',
  NBFC_ADMIN = 'nbfc_admin',
  NBFC_USER = 'nbfc_user',
  LOGISTICS_ADMIN = 'logistics_admin',
  LOGISTICS_USER = 'logistics_user'
}

export enum OrganizationType {
  BANK = 'bank',
  NBFC = 'nbfc',
  CORPORATE = 'corporate',
  LOGISTICS = 'logistics',
  INSURANCE = 'insurance'
}

export enum Permission {
  LC_CREATE = 'lc:create',
  LC_APPROVE = 'lc:approve',
  LC_VIEW = 'lc:view',
  LC_EDIT = 'lc:edit',
  DOCUMENT_UPLOAD = 'document:upload',
  DOCUMENT_VERIFY = 'document:verify',
  PAYMENT_PROCESS = 'payment:process',
  PAYMENT_VIEW = 'payment:view',
  COMPLIANCE_MANAGE = 'compliance:manage',
  REPORTS_VIEW = 'reports:view',
  USER_MANAGE = 'user:manage'
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
