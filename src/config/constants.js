module.exports = {
  // HTTP Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },

  // User Roles
  ROLES: {
    USER: 'user',
    ADMIN: 'admin',
  },

  // Password Requirements
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
  },

  // JWT
  JWT: {
    EXPIRY: process.env.JWT_EXPIRY || '24h',
  },

  // Blockchain
  BLOCKCHAIN: {
    CONFIRMATION_BLOCKS: 1,
    GAS_LIMIT: 500000,
  },

  // Wallet Funding
  WALLET: {
    FUNDING_AMOUNT: process.env.WALLET_FUNDING_AMOUNT || '0.1',
    MIN_BALANCE: process.env.MIN_WALLET_BALANCE || '0.01',
    REFUND_AMOUNT: process.env.WALLET_REFUND_AMOUNT || '0.05',
  },
};
