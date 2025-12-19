// Core type definitions for DeCap SDK

export interface DeCapProps {
  mode: 'simple' | 'advanced' | 'auto';
  userWallet?: WalletConnection; // Optional for simple mode
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  className?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  useTheme?: () => 'light' | 'dark'; // Hook from dapp for auto theme detection
  reputationScore?: number; // Optional: Pre-calculated reputation score (0-100) from developer's atom
}

export interface WalletConnection {
  address: string;
  signMessage: (message: string) => Promise<string>;
  isConnected: boolean;
}

export interface VerificationProof {
  success: boolean;
  puzzleCompleted: boolean;
  walletSignature?: string; // Optional - only present in advanced mode
  token: string;
  timestamp: number;
  challengeId: string;
  mode: 'simple' | 'advanced' | 'auto';
}

export interface DeCapConfig {
  mode?: 'simple' | 'advanced' | 'auto';
  theme?: 'light' | 'dark';
  customChallenges?: boolean;
  reputationThreshold?: {
    bypass: number; // Default: 70
    easy: number;   // Default: 50
  };
}

export interface ChallengeData {
  id: string;
  type: 'puzzle';
  content: LetterPuzzleContent;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

export interface LetterPuzzleContent {
  targetWord: string; // e.g., "CRYPTO"
  missingLetterIndex: number; // Position of missing letter (0-based)
  availableLetters: string[]; // Array of letter options including correct one
  correctLetter: string; // The correct letter to complete the word
}

export interface VerificationState {
  step: number;
  challengeId: string;
  userResponses: Record<string, any>;
  startTime: number;
  attempts: number;
  maxAttempts: number;
}

export interface DragState {
  isDragging: boolean;
  draggedLetter: string | null;
  dropZoneActive: boolean;
  isNearCorrectSlot: boolean;
  isAligned: boolean;
  dragPosition: { x: number; y: number };
}

export interface ReputationData {
  walletAddress: string;
  score: number; // 0-100 normalized score
  sources: ReputationSourceResult[];
  lastUpdated: number;
  cacheExpiry: number;
}

export interface ReputationSourceResult {
  source: 'custom' | 'etherscan' | 'alchemy' | 'fallback';
  rawScore: any;
  normalizedScore: number;
  weight: number;
  success: boolean;
  error?: string;
}

// Custom Scoring System Types
export interface WalletData {
  address: string;
  transactionCount: number;
  contractInteractions: number;
  knownProtocolInteractions: string[];
  walletAge: number; // in days
  tokenCount: number;
  nftCount: number;
  riskFlags: RiskFlag[];
  lastActivity: number; // timestamp
}

export interface RiskFlag {
  type: 'tornado_cash' | 'large_inflow' | 'large_outflow' | 'no_activity';
  severity: number; // -10 to -30
  description: string;
}

export interface ScoringWeights {
  transactionActivity: number; // Max 30 points
  contractInteractions: number; // Max 20 points
  walletAge: number; // Max 20 points
  tokenDiversity: number; // Max 10 points
  riskFlags: number; // Negative points
}

export interface ReputationConfig {
  easyThreshold: number; // Default: 40
  bypassThreshold: number; // Default: 70
  weights: ScoringWeights;
}

export interface CustomScoringAPI {
  fetchWalletData: (address: string, useReal?: boolean, apiKey?: string) => Promise<WalletData>;
  calculateScore: (data: WalletData) => number;
  generateMockData: (address: string) => WalletData; // @deprecated
}

// Orange Protocol types removed - use custom scoring system instead