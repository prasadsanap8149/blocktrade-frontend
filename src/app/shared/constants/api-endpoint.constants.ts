/**
 * API Endpoints Constants
 * Centralized API endpoint definitions for the BlockTrade platform
 */

export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  VERSION: 'v1',
  TIMEOUT: 30000, // 30 seconds
} as const;

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    REFRESH: '/auth/refresh',
    VERIFY_EMAIL: '/auth/verify-email',
  },

  // Role Management endpoints
  ROLES: {
    BASE: '/roles',
    ASSIGN: '/roles/assign',
    REVOKE: '/roles/revoke',
    USER_ROLES: (userId: string) => `/roles/user/${userId}`,
    PLATFORM: '/roles/platform',
    HIERARCHY: '/roles/hierarchy',
    INIT_ORGANIZATION: '/roles/init-organization',
  },

  // User Journey endpoints
  JOURNEY: {
    START: '/roles/journey/start',
    STATUS: (userId: string) => `/roles/journey/${userId}`,
    STEP: (stepNumber: number) => `/roles/journey/step/${stepNumber}`,
    CONFIG: '/roles/journey/config',
  },

  // Letters of Credit endpoints
  LETTERS_OF_CREDIT: {
    BASE: '/letters-of-credit',
    BY_ID: (id: string) => `/letters-of-credit/${id}`,
    APPROVE: (id: string) => `/letters-of-credit/${id}/approve`,
    REJECT: (id: string) => `/letters-of-credit/${id}/reject`,
    DOCUMENTS: (id: string) => `/letters-of-credit/${id}/documents`,
    STATUS: (id: string) => `/letters-of-credit/${id}/status`,
    HISTORY: (id: string) => `/letters-of-credit/${id}/history`,
    SEARCH: '/letters-of-credit/search',
    STATISTICS: '/letters-of-credit/statistics',
  },

  // Documents endpoints
  DOCUMENTS: {
    BASE: '/documents',
    BY_ID: (id: string) => `/documents/${id}`,
    VERIFY: (id: string) => `/documents/${id}/verify`,
    DOWNLOAD: (id: string) => `/documents/${id}/download`,
    UPLOAD: '/documents/upload',
    BULK_UPLOAD: '/documents/bulk-upload',
  },

  // Payments endpoints
  PAYMENTS: {
    BASE: '/payments',
    BY_ID: (id: string) => `/payments/${id}`,
    PROCESS: (id: string) => `/payments/${id}/process`,
    CANCEL: (id: string) => `/payments/${id}/cancel`,
    HISTORY: '/payments/history',
    ESCROW: '/payments/escrow',
  },

  // Organizations endpoints
  ORGANIZATIONS: {
    BASE: '/organizations',
    BY_ID: (id: string) => `/organizations/${id}`,
    USERS: (id: string) => `/organizations/${id}/users`,
    STATISTICS: (id: string) => `/organizations/${id}/statistics`,
    KYC: (id: string) => `/organizations/${id}/kyc`,
  },

  // Users endpoints
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    ACTIVATE: (id: string) => `/users/${id}/activate`,
    DEACTIVATE: (id: string) => `/users/${id}/deactivate`,
  },

  // Reports and Analytics endpoints
  REPORTS: {
    DASHBOARD: '/reports/dashboard',
    LC_ANALYTICS: '/reports/letters-of-credit',
    PAYMENT_ANALYTICS: '/reports/payments',
    USER_ACTIVITY: '/reports/user-activity',
    COMPLIANCE: '/reports/compliance',
    EXPORT: '/reports/export',
  },

  // Notifications endpoints
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    PREFERENCES: '/notifications/preferences',
  },

  // Compliance endpoints
  COMPLIANCE: {
    KYC: '/compliance/kyc',
    AML: '/compliance/aml',
    AUDIT_TRAIL: '/compliance/audit-trail',
    VIOLATIONS: '/compliance/violations',
  },

  // Supply Chain endpoints
  SUPPLY_CHAIN: {
    TRACK: '/supply-chain/track',
    SHIPMENTS: '/supply-chain/shipments',
    MILESTONES: '/supply-chain/milestones',
  },

  // Settings endpoints
  SETTINGS: {
    PREFERENCES: '/settings/preferences',
    SECURITY: '/settings/security',
    NOTIFICATIONS: '/settings/notifications',
    ORGANIZATION: '/settings/organization',
  },

  // Utility endpoints
  UTILITY: {
    HEALTH: '/health',
    INFO: '/info',
    CURRENCIES: '/utility/currencies',
    COUNTRIES: '/utility/countries',
    DOCUMENT_TYPES: '/utility/document-types',
  },
} as const;

// Query parameter constants
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SORT: 'sort',
  ORDER: 'order',
  SEARCH: 'search',
  STATUS: 'status',
  DATE_FROM: 'dateFrom',
  DATE_TO: 'dateTo',
  ORGANIZATION_ID: 'organizationId',
  USER_ID: 'userId',
  ROLE: 'role',
  TYPE: 'type',
  CURRENCY: 'currency',
  AMOUNT_FROM: 'amountFrom',
  AMOUNT_TO: 'amountTo',
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// Content Types
export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
} as const;
