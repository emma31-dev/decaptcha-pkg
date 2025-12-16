// Core type definitions for DeCap SDK

export interface DeCapProps {
  mode: 'simple' | 'advanced' | 'auto';
  userWallet: WalletConnection;
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  className?: string;
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  useTheme?: () => 'light' | 'dark'; // Hook from dapp for auto theme detection
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
  source: 'orange' | 'gitcoin' | 'lens' | 'manual';
  rawScore: any;
  normalizedScore: number;
  weight: number;
  success: boolean;
  error?: string;
}

// Orange Protocol specific types
export interface OrangeProtocolInput {
  result: {
    snsInfos: Array<{
      snsType: 'Discord' | 'Google' | 'Telegram' | 'Twitter';
      snsId: string;
      userName: string;
      joinedTime?: number;
      followerCount?: number;
      TweetsCount?: number;
    }>;
    pohInfos: Array<{
      pohType: string;
    }>;
    ensInfos: string[]; // Array of ENS names matching pattern ^[a-zA-Z0-9]+\.eth$
  };
}

export interface OrangeProtocolOutput extends OrangeProtocolInput {
  reputationScore?: number;
}

export interface OrangeProtocolAPI {
  validateInput: (data: any) => boolean;
  generateMockScore: (input: OrangeProtocolInput) => number;
  processRequest: (input: OrangeProtocolInput) => Promise<OrangeProtocolOutput>;
}