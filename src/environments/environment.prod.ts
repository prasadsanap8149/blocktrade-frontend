export const environment = {
  production: true,
  apiUrl: 'https://api.tradefinance.com/api',
  wsUrl: 'wss://api.tradefinance.com',
  blockchainUrl: 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
  appName: 'TradeFinance',
  version: '1.0.0',
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableOfflineMode: true,
    enablePWA: true,
    enableDebugMode: false,
    enableMockData: false
  },
  auth: {
    tokenKey: 'trade_finance_token',
    refreshTokenKey: 'trade_finance_refresh_token',
    tokenExpirationKey: 'trade_finance_token_expiration',
    sessionTimeout: 3600000, // 1 hour in milliseconds
    refreshThreshold: 300000 // 5 minutes in milliseconds
  },
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000
  },
  database: {
    type: 'mysql',
    connectionTimeout: 30000,
    maxRetries: 3
  },
  cache: {
    defaultTTL: 300000, // 5 minutes
    maxSize: 100 // Maximum number of cached items
  },
  ui: {
    theme: 'light',
    language: 'en',
    dateFormat: 'MM/DD/YYYY',
    timezone: 'UTC',
    itemsPerPage: 10,
    maxFileSize: 10485760 // 10MB in bytes
  }
};
