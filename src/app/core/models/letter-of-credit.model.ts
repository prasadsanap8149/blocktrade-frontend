/**
 * Letter of Credit Models and Interfaces
 * Type definitions for LC-related data structures
 */

export interface LetterOfCredit {
  id: string;
  lcNumber: string;
  applicant: LCParty;
  beneficiary: LCParty;
  issuingBank: BankDetails;
  advisingBank?: BankDetails;
  confirmingBank?: BankDetails;
  amount: Amount;
  applicationDate: Date;
  expiryDate: Date;
  status: LCStatus;
  type: LCType;
  terms: LCTerms;
  documents: LCDocument[];
  workflow: LCWorkflow;
  payments: LCPayment[];
  version: number;
  blockchainTxId?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy: string;
}

export interface CreateLCRequest {
  applicant: LCPartyInput;
  beneficiary: LCPartyInput;
  issuingBankId: string;
  advisingBankId?: string;
  confirmingBankId?: string;
  amount: Amount;
  expiryDate: Date;
  type: LCType;
  terms: LCTermsInput;
  notes?: string;
}

export interface UpdateLCRequest {
  amount?: Amount;
  expiryDate?: Date;
  terms?: Partial<LCTermsInput>;
  notes?: string;
}

export interface LCStatusUpdate {
  status: LCStatus;
  reason: string;
  comments?: string;
  metadata?: Record<string, any>;
}

export interface LCParty {
  id: string;
  name: string;
  address: Address;
  contact: ContactDetails;
  registrationNumber?: string;
  taxId?: string;
  swiftCode?: string;
  accountNumber?: string;
}

export interface LCPartyInput {
  id?: string;
  name: string;
  address: Address;
  contact: ContactDetails;
  registrationNumber?: string;
  taxId?: string;
  swiftCode?: string;
  accountNumber?: string;
}

export interface BankDetails {
  id: string;
  name: string;
  swiftCode: string;
  address: Address;
  contact: ContactDetails;
  correspondentBanks?: BankDetails[];
}

export interface Amount {
  value: number;
  currency: string;
  tolerancePercentage?: number;
}

export interface ContactDetails {
  name: string;
  email: string;
  phone: string;
  designation?: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}

export interface LCTerms {
  paymentTerms: PaymentTerms;
  goodsDescription: string;
  portOfLoading: string;
  portOfDischarge: string;
  latestShipmentDate: Date;
  presentationPeriod: number; // days
  requiredDocuments: DocumentRequirement[];
  specialConditions?: string[];
  partialShipments: boolean;
  transshipment: boolean;
  incoterms?: string;
  packingDetails?: string;
  markingDetails?: string;
  insuranceRequirement?: InsuranceRequirement;
}

export interface LCTermsInput {
  paymentTerms: PaymentTerms;
  goodsDescription: string;
  portOfLoading: string;
  portOfDischarge: string;
  latestShipmentDate: Date;
  presentationPeriod: number;
  requiredDocuments: DocumentRequirement[];
  specialConditions: string[];
  partialShipments: boolean;
  transshipment: boolean;
  incoterms?: string;
  packingDetails?: string;
  markingDetails?: string;
  insuranceRequirement?: InsuranceRequirement;
}

export interface DocumentRequirement {
  type: DocumentType;
  description: string;
  isRequired: boolean;
  copies: number;
  issuer?: string;
  specialInstructions?: string;
}

export interface InsuranceRequirement {
  coveragePercentage: number;
  type: string;
  risks: string[];
  provider?: string;
}

export interface LCDocument {
  id: string;
  lcId: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  hash: string;
  submittedBy: string;
  submittedAt: Date;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: Date;
  discrepancies?: Discrepancy[];
  version: number;
  content?: DocumentContent;
  blockchainTxId?: string;
}

export interface DocumentContent {
  invoiceNumber?: string;
  invoiceDate?: Date;
  totalAmount?: Amount;
  items?: InvoiceItem[];
  shipper?: string;
  consignee?: string;
  vessel?: string;
  voyageNumber?: string;
  billOfLadingNumber?: string;
  [key: string]: any;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  hsCode?: string;
  weight?: number;
  volume?: number;
}

export interface Discrepancy {
  id: string;
  type: DiscrepancyType;
  field: string;
  description: string;
  severity: DiscrepancySeverity;
  expectedValue?: string;
  actualValue?: string;
  isResolved: boolean;
  resolution?: string;
  resolvedBy?: string;
  resolvedAt?: Date;
}

export interface LCWorkflow {
  steps: WorkflowStep[];
  currentStepIndex: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: WorkflowStepStatus;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
  documents?: string[];
  nextSteps?: string[];
  estimatedDuration?: number; // hours
}

export interface LCPayment {
  id: string;
  lcId: string;
  type: PaymentType;
  amount: Amount;
  fromAccount: string;
  toAccount: string;
  bankReference?: string;
  status: PaymentStatus;
  processedBy?: string;
  processedAt?: Date;
  failureReason?: string;
  blockchainTxId?: string;
  escrowId?: string;
  createdAt: Date;
}

export interface LCStatistics {
  totalLCs: number;
  lcsByStatus: Record<LCStatus, number>;
  lcsByType: Record<LCType, number>;
  totalValue: Amount;
  averageValue: Amount;
  processingTime: {
    average: number;
    median: number;
    fastest: number;
    slowest: number;
  };
  successRate: number;
  complianceRate: number;
}

export interface LCSearchFilters {
  status?: LCStatus[];
  type?: LCType[];
  applicantId?: string;
  beneficiaryId?: string;
  issuingBankId?: string;
  advisingBankId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  currency?: string[];
  expiryDateFrom?: Date;
  expiryDateTo?: Date;
  search?: string;
}

export interface LCSearchParams extends LCSearchFilters {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface LCSearchResult {
  lcs: LetterOfCredit[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: LCSearchFilters;
  aggregations?: {
    totalValue: Amount;
    averageValue: Amount;
    statusDistribution: Record<LCStatus, number>;
  };
}

// Enums
export enum LCStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  ISSUED = 'issued',
  ADVISED = 'advised',
  CONFIRMED = 'confirmed',
  DOCUMENTS_SUBMITTED = 'documents_submitted',
  DOCUMENTS_UNDER_REVIEW = 'documents_under_review',
  DOCUMENTS_COMPLIANT = 'documents_compliant',
  DOCUMENTS_WITH_DISCREPANCIES = 'documents_with_discrepancies',
  PAYMENT_AUTHORIZED = 'payment_authorized',
  PAYMENT_PROCESSED = 'payment_processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  REJECTED = 'rejected'
}

export enum LCType {
  COMMERCIAL = 'commercial',
  STANDBY = 'standby',
  REVOLVING = 'revolving',
  TRANSFERABLE = 'transferable',
  BACK_TO_BACK = 'back_to_back',
  RED_CLAUSE = 'red_clause',
  GREEN_CLAUSE = 'green_clause'
}

export enum PaymentTerms {
  AT_SIGHT = 'at_sight',
  DEFERRED = 'deferred',
  ACCEPTANCE = 'acceptance',
  NEGOTIATION = 'negotiation',
  MIXED = 'mixed'
}

export enum DocumentType {
  COMMERCIAL_INVOICE = 'commercial_invoice',
  BILL_OF_LADING = 'bill_of_lading',
  AIRWAY_BILL = 'airway_bill',
  PACKING_LIST = 'packing_list',
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  INSPECTION_CERTIFICATE = 'inspection_certificate',
  WEIGHT_CERTIFICATE = 'weight_certificate',
  QUALITY_CERTIFICATE = 'quality_certificate',
  PHYTOSANITARY_CERTIFICATE = 'phytosanitary_certificate',
  CUSTOMS_DECLARATION = 'customs_declaration',
  EXPORT_LICENSE = 'export_license',
  IMPORT_LICENSE = 'import_license',
  HEALTH_CERTIFICATE = 'health_certificate',
  DRAFT = 'draft',
  PROMISSORY_NOTE = 'promissory_note',
  OTHER = 'other'
}

export enum VerificationStatus {
  PENDING = 'pending',
  UNDER_REVIEW = 'under_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  CONDITIONALLY_ACCEPTED = 'conditionally_accepted'
}

export enum DiscrepancyType {
  AMOUNT_MISMATCH = 'amount_mismatch',
  DATE_DISCREPANCY = 'date_discrepancy',
  DOCUMENT_MISSING = 'document_missing',
  DESCRIPTION_MISMATCH = 'description_mismatch',
  SIGNATURE_MISSING = 'signature_missing',
  ENDORSEMENT_MISSING = 'endorsement_missing',
  TERMS_VIOLATION = 'terms_violation',
  FORMAT_ERROR = 'format_error',
  CALCULATION_ERROR = 'calculation_error',
  OTHER = 'other'
}

export enum DiscrepancySeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical'
}

export enum WorkflowStepStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
  CANCELLED = 'cancelled'
}

export enum PaymentType {
  ESCROW = 'escrow',
  RELEASE = 'release',
  FEE = 'fee',
  REFUND = 'refund',
  PARTIAL = 'partial'
}

export enum PaymentStatus {
  PENDING = 'pending',
  AUTHORIZED = 'authorized',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

// Status transition rules
export const LC_STATUS_TRANSITIONS: Record<LCStatus, LCStatus[]> = {
  [LCStatus.DRAFT]: [LCStatus.PENDING_APPROVAL, LCStatus.CANCELLED],
  [LCStatus.PENDING_APPROVAL]: [LCStatus.APPROVED, LCStatus.REJECTED, LCStatus.CANCELLED],
  [LCStatus.APPROVED]: [LCStatus.ISSUED, LCStatus.CANCELLED],
  [LCStatus.ISSUED]: [LCStatus.ADVISED, LCStatus.DOCUMENTS_SUBMITTED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.ADVISED]: [LCStatus.CONFIRMED, LCStatus.DOCUMENTS_SUBMITTED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.CONFIRMED]: [LCStatus.DOCUMENTS_SUBMITTED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.DOCUMENTS_SUBMITTED]: [LCStatus.DOCUMENTS_UNDER_REVIEW, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.DOCUMENTS_UNDER_REVIEW]: [LCStatus.DOCUMENTS_COMPLIANT, LCStatus.DOCUMENTS_WITH_DISCREPANCIES, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.DOCUMENTS_COMPLIANT]: [LCStatus.PAYMENT_AUTHORIZED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.DOCUMENTS_WITH_DISCREPANCIES]: [LCStatus.DOCUMENTS_SUBMITTED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.PAYMENT_AUTHORIZED]: [LCStatus.PAYMENT_PROCESSED, LCStatus.EXPIRED, LCStatus.CANCELLED],
  [LCStatus.PAYMENT_PROCESSED]: [LCStatus.COMPLETED],
  [LCStatus.COMPLETED]: [],
  [LCStatus.CANCELLED]: [],
  [LCStatus.EXPIRED]: [],
  [LCStatus.REJECTED]: []
};

// Default workflow template
export const DEFAULT_LC_WORKFLOW_TEMPLATE: Omit<WorkflowStep, 'id' | 'status' | 'completedBy' | 'completedAt' | 'timestamp' | 'user'>[] = [
  {
    name: 'LC Creation',
    description: 'Create and submit Letter of Credit application',
    estimatedDuration: 2
  },
  {
    name: 'Bank Review', 
    description: 'Initial review by issuing bank',
    estimatedDuration: 24
  },
  {
    name: 'Approval',
    description: 'LC approval by bank authorities',
    estimatedDuration: 48
  },
  {
    name: 'Issuance',
    description: 'Issue LC to beneficiary via advising bank',
    estimatedDuration: 12
  },
  {
    name: 'Confirmation',
    description: 'LC confirmation by confirming bank (if applicable)',
    estimatedDuration: 24
  },
  {
    name: 'Document Submission',
    description: 'Beneficiary submits required documents',
    estimatedDuration: 72
  },
  {
    name: 'Document Review',
    description: 'Bank reviews submitted documents for compliance',
    estimatedDuration: 48
  },
  {
    name: 'Payment Processing',
    description: 'Process payment upon document acceptance',
    estimatedDuration: 24
  },
  {
    name: 'Completion',
    description: 'LC transaction completion and closure',
    estimatedDuration: 12
  }
];

// Additional interfaces for extensions and amendments
export interface LCAmendment {
  id: string;
  amendmentNumber: number;
  requestedBy: string;
  requestedAt: Date;
  changes: AmendmentChange[];
  status: AmendmentStatus;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
}

export interface AmendmentChange {
  field: string;
  oldValue: any;
  newValue: any;
  reason: string;
}

export interface PaymentDetails {
  transactionId: string;
  amount: number;
  currency: string;
  processedAt: Date;
  processedBy: string;
  escrowId?: string;
  bankReference?: string;
}

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  address: string;
  contactPerson?: string;
  swiftCode?: string;
  accountNumber?: string;
}

export enum AmendmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum OrganizationType {
  BANK = 'bank',
  NBFC = 'nbfc',
  CORPORATE = 'corporate',
  LOGISTICS = 'logistics'
}

// Request/Response DTOs for extended functionality
export interface CreateLCRequestExtended {
  applicant: Partial<Organization>;
  beneficiary: Partial<Organization>;
  advisingBank?: Partial<Organization>;
  amount: number;
  currency: string;
  expiryDate: string;
  terms: Partial<LCTerms>;
}

export interface LCFilter {
  status?: LCStatus[];
  applicantId?: string;
  beneficiaryId?: string;
  issuingBankId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  amountFrom?: number;
  amountTo?: number;
  currency?: string;
}

export interface LCListResponse {
  lcs: LetterOfCredit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
