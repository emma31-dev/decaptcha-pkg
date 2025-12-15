// DeCap SDK - Decentralized CAPTCHA for Web3
// Main export file for the DeCap package

export { DeCap } from './components/DeCap';
export { useCaptcha } from './hooks/useCaptcha';

// Type exports
export type {
  DeCapProps,
  VerificationProof,
  WalletConnection,
  DeCapConfig,
  ChallengeData,
  VerificationState
} from './types';

// Utility exports
export { verifySignature } from './lib/signature';
export { generateChallenge } from './lib/challenge';