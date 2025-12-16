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
  OrangeProtocolInput,
  OrangeProtocolOutput
} from './types';

// Utility exports
export { verifySignature } from './lib/signature';
export { generateChallenge } from './lib/challenge';
export { fetchWalletReputation } from './lib/reputation';

// Orange Protocol utilities
export { 
  orangeProtocolAPI, 
  fetchOrangeReputationScore, 
  createSampleOrangeInput 
} from './utils/orangeProtocol';
export { 
  fetchOrangeScore, 
  validateOrangeInput, 
  createOrangeInput 
} from './utils/fetchOrangeScore';

// UUID utilities
export { 
  generateUUID, 
  generateShortUUID, 
  generateSecureNonce, 
  isValidUUID 
} from './utils/uuid';