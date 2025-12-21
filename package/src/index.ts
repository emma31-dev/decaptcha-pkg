// DeCap SDK - Decentralized CAPTCHA for Web3
// Main export file for the DeCap package

export { DeCap } from './components/DeCap';
export { useCaptchaLogic } from './hooks/useCaptcha';
export { useWalletReputation } from './hooks/useWalletReputation';

// Theme exports
export { ThemeProvider, useDeCapTheme, withTheme } from './themes/ThemeProvider';
export { lightTheme, darkTheme, getTheme, generateThemeCSS } from './themes';
export type { Theme } from './themes';

// Type exports
export type {
  DeCapProps,
  VerificationProof,
  WalletConnection,
  DeCapConfig,
  ChallengeData,
  VerificationState,
  ReputationData,
  WalletData,
  RiskFlag,
  ScoringWeights,
  ReputationConfig,
  CustomScoringAPI
} from './types';

// Utility exports
export { verifySignature } from './lib/signature';
export { generateChallenge } from './lib/challenge';
export { 
  fetchWalletReputation, 
  normalizeScore, 
  clearReputationCache, 
  getCaptchaMode 
} from './lib/reputation';

// Reputation Utilities for Developers (Main Integration Functions)
export {
  fetchWalletReputation as fetchReputationScore,
  batchFetchWalletReputation,
  createReputationFetcher,
  clearReputationCache as clearCache,
  getCachedReputation,
  getCaptchaModeFromScore,
  getTrustLevelFromScore
} from './utils/reputationUtils';
export type { ReputationResult, ReputationFetchOptions } from './utils/reputationUtils';

// Custom Reputation Scoring (Primary Export)
export { 
  calculateWalletReputation,
  calculateScore,
  generateMockWalletData,
  determineCaptchaMode,
  getTrustLevel,
  batchCalculateReputation,
  generateFallbackScore,
  customScoringAPI,
  DEFAULT_CONFIG,
  DEFAULT_WEIGHTS,
  KNOWN_PROTOCOLS
} from './lib/customScoring';

// Orange Protocol utilities removed - use custom scoring instead

// Blockchain Data Utilities
export { 
  EtherscanAPI,
  fetchRealWalletData,
  analyzeRiskFlags,
  detectProtocolInteractions,
  calculateWalletAge,
  countAssets,
  defaultEtherscanAPI
} from './utils/etherscanApi';

// UUID utilities
export { 
  generateUUID, 
  generateShortUUID, 
  generateSecureNonce, 
  isValidUUID 
} from './utils/uuid';

// Configuration utilities
export { 
  initializeConfig, 
  getConfig, 
  updateConfig,
  getEtherscanConfig,
  getReputationConfig,
  getSecurityConfig,
  getUIConfig,
  getDevelopmentConfig,
  isDebugMode,
  shouldUseMockData
} from './utils/config';