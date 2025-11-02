export interface LetterOfCredit {
  id: string;
  lcNumber: string;
  applicant: Organization;
  beneficiary: Organization;
  issuingBank: Organization;
  advisingBank?: Organization;
  amount: number;
  currency: string;
  applicationDate: Date;
  expiryDate: Date;
  status: LCStatus;
  terms: LCTerms;
  documents: LCDocument[];
  amendments: LCAmendment[];
  paymentDetails?: PaymentDetails;
  workflow: LCWorkflow;
  version: number;
  blockchainTxId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LCTerms {
  paymentTerms: string;
  goodsDescription: string;
  portOfLoading: string;
  portOfDischarge: string;
  latestShipmentDate: Date;
  requiredDocuments: DocumentType[];
  specialConditions?: string[];
  autoProcessPayment?: boolean;
  insuranceCoveragePercentage?: number;
  requiredInsuranceRisks?: string[];
  countryOfOrigin?: string;
  expectedPackages?: number;
  expectedWeight?: number;
  weightTolerance?: number;
}

export interface LCDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  fileUrl: string;
  hash: string;
  content?: any;
  submittedAt: Date;
  submittedBy: string;
  verificationStatus: VerificationStatus;
  discrepancies?: DocumentDiscrepancy[];
}

export interface DocumentDiscrepancy {
  type: DiscrepancyType;
  field?: string;
  expected?: string;
  actual?: string;
  description: string;
  severity: DiscrepancySeverity;
}

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

export interface LCWorkflow {
  created: WorkflowStep;
  approved?: WorkflowStep;
  documentsSubmitted?: WorkflowStep;
  paymentProcessed?: WorkflowStep;
  completed?: WorkflowStep;
}

export interface WorkflowStep {
  timestamp: Date;
  user: string;
  comments?: string;
  data?: any;
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

export enum LCStatus {
  DRAFT = 'draft',
  PENDING_APPROVAL = 'pending_approval',
  APPROVED = 'approved',
  DOCUMENTS_SUBMITTED = 'documents_submitted',
  DOCUMENTS_COMPLIANT = 'documents_compliant',
  DOCUMENTS_SUBMITTED_WITH_DISCREPANCIES = 'documents_submitted_with_discrepancies',
  PAYMENT_PROCESSED = 'payment_processed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum DiscrepancyType {
  AMOUNT_DISCREPANCY = 'amount_discrepancy',
  CURRENCY_MISMATCH = 'currency_mismatch',
  BENEFICIARY_MISMATCH = 'beneficiary_mismatch',
  APPLICANT_MISMATCH = 'applicant_mismatch',
  GOODS_DESCRIPTION_MISMATCH = 'goods_description_mismatch',
  LATE_SHIPMENT = 'late_shipment',
  PORT_MISMATCH = 'port_mismatch',
  CONSIGNEE_MISMATCH = 'consignee_mismatch',
  MISSING_DOCUMENT = 'missing_document',
  INSUFFICIENT_COVERAGE = 'insufficient_coverage',
  MISSING_RISK_COVERAGE = 'missing_risk_coverage',
  CROSS_DOCUMENT_AMOUNT_MISMATCH = 'cross_document_amount_mismatch',
  QUANTITY_MISMATCH = 'quantity_mismatch',
  ILLOGICAL_DATE_SEQUENCE = 'illogical_date_sequence'
}

export enum DiscrepancySeverity {
  CRITICAL = 'critical',
  MAJOR = 'major',
  MINOR = 'minor'
}

export enum AmendmentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export enum DocumentType {
  COMMERCIAL_INVOICE = 'commercial_invoice',
  BILL_OF_LADING = 'bill_of_lading',
  PACKING_LIST = 'packing_list',
  CERTIFICATE_OF_ORIGIN = 'certificate_of_origin',
  INSURANCE_CERTIFICATE = 'insurance_certificate',
  INSPECTION_CERTIFICATE = 'inspection_certificate',
  WEIGHT_CERTIFICATE = 'weight_certificate'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum OrganizationType {
  BANK = 'bank',
  NBFC = 'nbfc',
  CORPORATE = 'corporate',
  LOGISTICS = 'logistics'
}

// Request/Response DTOs
export interface CreateLCRequest {
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
