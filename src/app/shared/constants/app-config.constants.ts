/**
 * Application Configuration Constants
 * Global configuration settings for the BlockTrade platform
 */

export const APP_CONFIG = {
  // Application Information
  APP_NAME: 'BlockTrade',
  APP_TITLE: 'BlockTrade Finance Platform',
  APP_DESCRIPTION: 'Blockchain-based Trade Finance Platform for Banks and NBFCs',
  VERSION: '1.0.0',
  
  // Company Information
  COMPANY: {
    NAME: 'BlockTrade Inc.',
    WEBSITE: 'https://blocktrade.com',
    SUPPORT_EMAIL: 'support@blocktrade.com',
    CONTACT_EMAIL: 'contact@blocktrade.com',
    PHONE: '+1-800-BLOCKTRADE',
  },

  // Storage Keys
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'bt_access_token',
    REFRESH_TOKEN: 'bt_refresh_token',
    USER_DATA: 'bt_user_data',
    THEME: 'bt_theme',
    LANGUAGE: 'bt_language',
    PREFERENCES: 'bt_preferences',
    RECENT_SEARCHES: 'bt_recent_searches',
    DRAFT_DATA: 'bt_draft_data',
    ONBOARDING_STATUS: 'bt_onboarding_status',
    LAST_LOGIN: 'bt_last_login',
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    PAGE_SIZE_OPTIONS: [5, 10, 25, 50, 100],
    MAX_PAGE_SIZE: 100,
  },

  // File Upload Configuration
  FILE_UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: {
      DOCUMENTS: ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png'],
      IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      EXCEL: ['.xls', '.xlsx', '.csv'],
    },
    MIME_TYPES: {
      PDF: 'application/pdf',
      DOC: 'application/msword',
      DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      JPG: 'image/jpeg',
      PNG: 'image/png',
      CSV: 'text/csv',
      XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    },
  },

  // Security Settings
  SECURITY: {
    TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
    PASSWORD_MIN_LENGTH: 8,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },

  // Theme Configuration
  THEMES: {
    LIGHT: 'light',
    DARK: 'dark',
    AUTO: 'auto',
  },

  // Language Configuration
  LANGUAGES: {
    EN: 'en',
    ES: 'es',
    FR: 'fr',
    DE: 'de',
    ZH: 'zh',
    JA: 'ja',
  },

  // Date/Time Formats
  DATE_FORMATS: {
    SHORT: 'MM/dd/yyyy',
    LONG: 'MMMM dd, yyyy',
    ISO: 'yyyy-MM-dd',
    DATETIME: 'MM/dd/yyyy HH:mm',
    TIME: 'HH:mm',
  },

  // Currency Configuration
  CURRENCIES: {
    DEFAULT: 'USD',
    SUPPORTED: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'INR', 'AUD', 'CAD', 'CHF', 'SEK'],
  },

  // Organization Types
  ORGANIZATION_TYPES: {
    BANK: 'bank',
    NBFC: 'nbfc',
    CORPORATE: 'corporate',
    LOGISTICS: 'logistics',
    INSURANCE: 'insurance',
  },

  // Letter of Credit Configuration
  LC_CONFIG: {
    STATUSES: {
      DRAFT: 'draft',
      PENDING_APPROVAL: 'pending_approval',
      APPROVED: 'approved',
      DOCUMENTS_SUBMITTED: 'documents_submitted',
      DOCUMENTS_COMPLIANT: 'documents_compliant',
      DOCUMENTS_SUBMITTED_WITH_DISCREPANCIES: 'documents_submitted_with_discrepancies',
      PAYMENT_PROCESSED: 'payment_processed',
      COMPLETED: 'completed',
      CANCELLED: 'cancelled',
      EXPIRED: 'expired',
    },
    TYPES: {
      COMMERCIAL: 'commercial',
      STANDBY: 'standby',
    },
    DEFAULT_EXPIRY_DAYS: 90,
    MIN_AMOUNT: 1000,
    MAX_AMOUNT: 100000000, // 100M
  },

  // Document Types
  DOCUMENT_TYPES: {
    COMMERCIAL_INVOICE: 'commercial_invoice',
    BILL_OF_LADING: 'bill_of_lading',
    PACKING_LIST: 'packing_list',
    CERTIFICATE_OF_ORIGIN: 'certificate_of_origin',
    INSURANCE_CERTIFICATE: 'insurance_certificate',
    INCORPORATION_CERTIFICATE: 'incorporation_certificate',
    TAX_CERTIFICATE: 'tax_certificate',
    BANK_STATEMENT: 'bank_statement',
  },

  // Payment Configuration
  PAYMENT_CONFIG: {
    TYPES: {
      ESCROW: 'escrow',
      RELEASE: 'release',
      FEE: 'fee',
      REFUND: 'refund',
    },
    STATUSES: {
      PENDING: 'pending',
      PROCESSING: 'processing',
      COMPLETED: 'completed',
      FAILED: 'failed',
      CANCELLED: 'cancelled',
    },
  },

  // Notification Configuration
  NOTIFICATIONS: {
    TYPES: {
      SUCCESS: 'success',
      ERROR: 'error',
      WARNING: 'warning',
      INFO: 'info',
    },
    DURATION: {
      SHORT: 3000,
      MEDIUM: 5000,
      LONG: 8000,
      PERMANENT: 0,
    },
    POSITION: {
      TOP_RIGHT: 'top-right',
      TOP_LEFT: 'top-left',
      BOTTOM_RIGHT: 'bottom-right',
      BOTTOM_LEFT: 'bottom-left',
      TOP_CENTER: 'top-center',
      BOTTOM_CENTER: 'bottom-center',
    },
  },

  // API Configuration
  API: {
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
    REQUEST_TIMEOUT: 30000,
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  },

  // Feature Flags
  FEATURES: {
    DARK_MODE: true,
    MULTI_LANGUAGE: true,
    PWA: true,
    OFFLINE_MODE: true,
    REAL_TIME_NOTIFICATIONS: true,
    BLOCKCHAIN_INTEGRATION: true,
    ADVANCED_ANALYTICS: true,
    EXPORT_FUNCTIONALITY: true,
    BULK_OPERATIONS: true,
    MOBILE_APP: true,
  },

  // Role Hierarchy
  ROLE_HIERARCHY: {
    PLATFORM: {
      SUPER_ADMIN: 'platform_super_admin',
      ADMIN: 'platform_admin',
      SUPPORT: 'platform_support',
    },
    ORGANIZATION: {
      SUPER_ADMIN: 'organization_super_admin',
      ADMIN: 'organization_admin',
      MANAGER: 'organization_manager',
      USER: 'organization_user',
      VIEWER: 'organization_viewer',
    },
    ENTITY_SPECIFIC: {
      BANK: {
        ADMIN: 'bank_admin',
        OFFICER: 'bank_officer',
        SPECIALIST: 'bank_specialist',
      },
      CORPORATE: {
        ADMIN: 'corporate_admin',
        MANAGER: 'corporate_manager',
        USER: 'corporate_user',
      },
      NBFC: {
        ADMIN: 'nbfc_admin',
        MANAGER: 'nbfc_manager',
        USER: 'nbfc_user',
      },
      LOGISTICS: {
        ADMIN: 'logistics_admin',
        MANAGER: 'logistics_manager',
        USER: 'logistics_user',
      },
      INSURANCE: {
        ADMIN: 'insurance_admin',
        MANAGER: 'insurance_manager',
        USER: 'insurance_user',
      },
    },
  },

  // Journey Configuration
  JOURNEY: {
    STEPS: {
      ORGANIZATION_SETUP: 1,
      PROFILE_COMPLETION: 2,
      SECURITY_SETUP: 3,
      PREFERENCES_SETUP: 4,
      TRAINING_COMPLETION: 5,
    },
    TOTAL_STEPS: 5,
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_PATTERN: /^\+?[\d\s\-\(\)]+$/,
    PASSWORD_PATTERN: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    LC_NUMBER_PATTERN: /^LC-\d{4}-\d{3,6}$/,
    AMOUNT_PATTERN: /^\d+(\.\d{1,2})?$/,
  },

  // Chart Configuration
  CHARTS: {
    DEFAULT_COLORS: [
      '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd',
      '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'
    ],
    ANIMATION_DURATION: 750,
  },

  // Error Codes
  ERROR_CODES: {
    // Authentication Errors
    AUTH_001: 'Invalid credentials',
    AUTH_002: 'Token expired',
    AUTH_003: 'Token invalid',
    AUTH_004: 'Account locked',
    AUTH_005: 'Email not verified',

    // Validation Errors
    VAL_001: 'Required field missing',
    VAL_002: 'Invalid field format',
    VAL_003: 'Field value out of range',
    VAL_004: 'Invalid file type',
    VAL_005: 'File size too large',

    // Business Logic Errors
    BIZ_001: 'LC amount exceeds limit',
    BIZ_002: 'Organization not verified',
    BIZ_003: 'Document verification failed',
    BIZ_004: 'Payment processing failed',
    BIZ_005: 'LC already approved',

    // System Errors
    SYS_001: 'Database connection error',
    SYS_002: 'External service unavailable',
    SYS_003: 'File upload failed',
    SYS_004: 'Blockchain transaction failed',
  },

  // Social Media Links
  SOCIAL_MEDIA: {
    TWITTER: 'https://twitter.com/blocktrade',
    LINKEDIN: 'https://linkedin.com/company/blocktrade',
    FACEBOOK: 'https://facebook.com/blocktrade',
    YOUTUBE: 'https://youtube.com/blocktrade',
  },

  // Legal Links
  LEGAL: {
    TERMS_OF_SERVICE: '/legal/terms',
    PRIVACY_POLICY: '/legal/privacy',
    COOKIE_POLICY: '/legal/cookies',
    SECURITY_POLICY: '/legal/security',
  },

  // Help & Support
  SUPPORT: {
    DOCUMENTATION: '/docs',
    FAQ: '/faq',
    CONTACT: '/contact',
    CHAT_SUPPORT: true,
    KNOWLEDGE_BASE: '/kb',
  },
} as const;

// Environment-specific configurations
export const ENVIRONMENT_CONFIG = {
  development: {
    API_BASE_URL: 'http://localhost:3000/api',
    ENABLE_LOGGING: true,
    DEBUG_MODE: true,
    MOCK_API: false,
  },
  staging: {
    API_BASE_URL: 'https://staging-api.blocktrade.com/api',
    ENABLE_LOGGING: true,
    DEBUG_MODE: false,
    MOCK_API: false,
  },
  production: {
    API_BASE_URL: 'https://api.blocktrade.com/api',
    ENABLE_LOGGING: false,
    DEBUG_MODE: false,
    MOCK_API: false,
  },
} as const;

// Type definitions for type safety
export type ThemeType = keyof typeof APP_CONFIG.THEMES;
export type LanguageType = keyof typeof APP_CONFIG.LANGUAGES;
export type OrganizationType = keyof typeof APP_CONFIG.ORGANIZATION_TYPES;
export type NotificationType = keyof typeof APP_CONFIG.NOTIFICATIONS.TYPES;
