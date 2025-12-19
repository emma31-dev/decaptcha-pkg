# DecapModal Design Document

## Overview

The DecapModal is a React component that provides a decentralized captcha verification interface through a modal dialog. It implements a multi-step workflow that guides users through verification challenges while maintaining a clean, responsive user interface. The component is designed to be easily integrated into existing React applications with TypeScript support.

## Architecture

### Component Structure

```
DecapModal (Main Container)
├── ModalOverlay (Background & positioning)
├── ModalContent (Main content area)
│   ├── ModalHeader (Title, close button, progress indicator)
│   ├── ModalBody (Dynamic content based on current step)
│   │   ├── InstructionStep (Initial instructions and word display)
│   │   ├── PuzzleStep (Interactive letter drag-and-drop)
│   │   ├── WalletSignStep (Wallet message signing prompt - advanced mode only)
│   │   └── SuccessStep (Verification success with checkmark)
│   └── ModalFooter (Navigation buttons, actions)
└── ModalBackdrop (Click-to-close overlay)
```

### State Management

The component will use React's built-in state management with the following key state variables:

- `currentStep`: Number indicating the active step (1-2 for simple mode, 1-3 for advanced mode)
- `isOpen`: Boolean controlling modal visibility
- `verificationData`: Object storing user input and verification progress
- `walletSignature`: String storing the wallet signature from step 2
- `isLoading`: Boolean for async operations
- `error`: String for error messages

## Components and Interfaces

### Main Component Interface

```typescript
interface DeCapProps {
  mode: 'simple' | 'advanced' | 'auto';
  userWallet: WalletConnection;
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  className?: string;
  children: React.ReactNode;
}

interface WalletConnection {
  address: string;
  signMessage: (message: string) => Promise<string>;
  isConnected: boolean;
}

interface GasPayerConfig {
  walletAddress: string;
  privateKey?: string;
  rpcUrl: string;
  chainId: number;
  gasLimit?: number;
  maxFeePerGas?: string;
}

interface DeCapConfig {
  gasPayer: GasPayerConfig;
  mode?: 'simple' | 'advanced' | 'auto';
  theme?: 'light' | 'dark';
  customChallenges?: boolean;
}

interface VerificationProof {
  success: boolean;
  puzzleCompleted: boolean;
  walletSignature?: string; // Optional - only present in advanced mode
  token: string;
  timestamp: number;
  challengeId: string;
  mode: 'simple' | 'advanced' | 'auto';
}

interface DecapModalConfig {
  theme?: 'light' | 'dark';
  size?: 'small' | 'medium' | 'large';
  closeOnBackdropClick?: boolean;
  showProgressIndicator?: boolean;
}
```

### Step Components

Each step will be implemented as a separate component:

```typescript
interface StepProps {
  onNext: (data?: any) => void;
  onPrevious?: () => void;
  onError: (error: string) => void;
  data?: any;
}

interface PuzzleStepProps extends StepProps {
  targetWord: string;
  missingLetterIndex: number;
  availableLetters: string[];
  correctLetter: string;
  onLetterDrop: (letter: string, isCorrect: boolean) => void;
}

interface LetterTileProps {
  letter: string;
  isDraggable: boolean;
  onDragStart: (letter: string) => void;
  onDragMove: (position: { x: number; y: number }) => void;
  onDragEnd: () => void;
  isBeingDragged: boolean;
  dragPosition?: { x: number; y: number };
}

interface HorizontalControlBarProps {
  isActive: boolean;
  onDrop: (letter: string) => void;
  onDragOver: (event: DragEvent) => void;
  onDragLeave: () => void;
  placedLetter?: string;
  isNearCorrectSlot: boolean;
  isAligned: boolean;
  showAlignmentGuide: boolean;
}

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number; // 2 for simple mode, 3 for advanced mode
  mode: 'simple' | 'advanced' | 'auto';
}

interface WalletSignStepProps extends StepProps {
  wallet: WalletConnection;
  message: string;
  onSignComplete: (signature: string) => void;
  onSignError: (error: Error) => void;
  showSuccessState: boolean;
}

interface WalletSignState {
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  signature: string | null;
}
```

### Hook for Modal State

```typescript
interface UseDecapModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  currentStep: number;
  nextStep: (data?: any) => void;
  previousStep: () => void;
  resetModal: () => void;
}
```

## Data Models

### Verification Flow State

```typescript
interface VerificationState {
  step: number;
  challengeId: string;
  userResponses: Record<string, any>;
  startTime: number;
  attempts: number;
  maxAttempts: number;
}
```

### Challenge Data

```typescript
interface ChallengeData {
  id: string;
  type: 'puzzle';
  content: LetterPuzzleContent;
  difficulty: 'easy' | 'medium' | 'hard';
  timeLimit?: number;
}

interface LetterPuzzleContent {
  targetWord: string; // e.g., "CRYPTO"
  missingLetterIndex: number; // Position of missing letter (0-based)
  availableLetters: string[]; // Array of letter options including correct one
  correctLetter: string; // The correct letter to complete the word
}

interface DragState {
  isDragging: boolean;
  draggedLetter: string | null;
  dropZoneActive: boolean;
  isNearCorrectSlot: boolean;
  isAligned: boolean;
  dragPosition: { x: number; y: number };
}

interface HapticFeedback {
  triggerProximityFeedback: () => void;
  triggerAlignmentFeedback: () => void;
  triggerSuccessFeedback: () => void;
}

interface ReputationData {
  walletAddress: string;
  score: number; // 0-100 normalized score
  sources: ReputationSourceResult[];
  lastUpdated: number;
  cacheExpiry: number;
}

interface ReputationSourceResult {
  source: 'custom' | 'etherscan' | 'alchemy' | 'fallback';
  rawScore: any;
  normalizedScore: number;
  weight: number;
  success: boolean;
  error?: string;
}
```

## Error Handling

### Error Types

1. **Network Errors**: Connection issues during verification
2. **Validation Errors**: Invalid user input or responses
3. **Timeout Errors**: User exceeds time limits
4. **Challenge Errors**: Issues loading or processing challenges

### Error Handling Strategy

- Display user-friendly error messages in the modal
- Provide retry mechanisms for recoverable errors
- Log detailed errors for debugging
- Graceful degradation when services are unavailable

```typescript
interface ErrorHandler {
  handleNetworkError: (error: NetworkError) => void;
  handleValidationError: (error: ValidationError) => void;
  handleTimeoutError: (error: TimeoutError) => void;
  handleGenericError: (error: Error) => void;
}
```

## Testing Strategy

### Unit Tests

- Component rendering and prop handling
- State management and transitions
- Event handlers and callbacks
- Error boundary behavior

### Integration Tests

- Multi-step workflow completion
- Modal open/close behavior
- Callback function execution
- Responsive design validation

### Test Structure

```typescript
describe('DecapModal', () => {
  describe('Rendering', () => {
    // Test component rendering with different props
  });
  
  describe('User Interactions', () => {
    // Test user flows through verification steps
  });
  
  describe('Error Handling', () => {
    // Test error scenarios and recovery
  });
  
  describe('Callbacks', () => {
    // Test success/error callback execution
  });
});
```

## Implementation Details

### Styling Approach

- Use CSS Modules for component styling with Apple-inspired design
- Implement responsive design with mobile-first approach
- Soft-blurred backdrop with centered modal card
- Minimal, clean interface with subtle transitions and soft shadows
- Smooth animations for drag-and-drop interactions
- Green checkmark animation for success states
- Green success highlight for successful wallet signing
- Shake animation with soft red feedback for incorrect attempts
- Three-bar progress indicator at the top right corner showing current step
- Horizontal control bar under the word for letter placement

### Verification Flow by Mode

The verification process varies based on the selected mode:

#### Simple Mode Flow (2 Pages)
1. **Page 1 - Puzzle**: User solves CAPTCHA letter puzzle challenge
2. **Page 2 - Success**: Display success confirmation and emit result

#### Advanced Mode Flow (3 Pages)
1. **Page 1 - Puzzle**: User solves CAPTCHA letter puzzle challenge
2. **Page 2 - Wallet Sign**: Prompt wallet sign → eth_signMessage() → verify signature → show green success highlight
3. **Page 3 - Success**: Display success confirmation and emit result

#### Auto Mode Flow
- Determines flow based on reputation score
- `score >= threshold ? simple_flow : advanced_flow`

```typescript
interface VerificationFlow {
  mode: 'simple' | 'advanced' | 'auto';
  solveCaptcha: () => Promise<boolean>;
  promptWalletSign?: (message: string) => void; // Optional for simple mode
  executeSignMessage?: (message: string) => Promise<string>; // Optional for simple mode
  verifySignature?: (signature: string, message: string) => Promise<boolean>; // Optional for simple mode
  emitResult: (proof: VerificationProof) => void;
}
```

### Drag-and-Drop Interaction

The core puzzle interaction involves:

1. **Word Display**: Shows "C _ R Y P T O" with missing letter slot
2. **Horizontal Control Bar**: Located under the word for letter placement control
3. **Letter Tiles**: 6 draggable letter options displayed below the control bar
4. **Progress Indicator**: 
   - Simple mode: Two bars at top right (1 filled on puzzle page, 2 filled on success page)
   - Advanced mode: Three bars at top right (1 filled on puzzle page, 2 filled on wallet sign page, 3 filled on success page)
5. **Drag Interaction**: 
   - Letter hovers under the word it's dragged from
   - Haptic feedback when letter gets close to correct slot
   - Visual alignment indicators when properly positioned
   - Snap-to-place behavior when aligned correctly
6. **Validation**: Immediate feedback when letter is placed
7. **Animations**: 
   - Green checkmark animation for correct puzzle placement
   - Shake animation with red feedback for incorrect attempts
   - Green success highlight animation after successful wallet signing
   - Smooth hover and alignment transitions
   - Haptic vibration on mobile devices for proximity feedback

```typescript
interface DragDropHandlers {
  handleDragStart: (letter: string) => void;
  handleDragMove: (event: DragEvent, position: { x: number; y: number }) => void;
  handleDragOver: (event: DragEvent) => void;
  handleDragLeave: () => void;
  handleDrop: (letter: string) => void;
  handleDragEnd: () => void;
  checkProximity: (dragPosition: { x: number; y: number }) => boolean;
  checkAlignment: (dragPosition: { x: number; y: number }) => boolean;
  triggerHapticFeedback: (type: 'proximity' | 'alignment' | 'success') => void;
}
```

### Custom Reputation Integration

The auto mode leverages custom onchain reputation scoring to adjust CAPTCHA difficulty or bypass verification entirely:

#### Reputation Score Sources
- **Custom Scoring Function**: Primary scoring based on onchain wallet activity
- **Mock API**: Simulates blockchain data fetching for development/testing
- **Etherscan API**: Real onchain data when available (transaction history, contract interactions)
- **Fallback Scoring**: Hash-based deterministic scoring when APIs are unavailable

#### Custom Reputation Scoring System

**Scoring Formula:**
```
Reputation Score = (Tx Activity Weight + Contract Interaction Weight + Age Weight + Diversity Weight) - Risk Flags
```

**Weights Breakdown (0–100 total):**
1. **Transaction Activity (0–30 points)**
   - 0–10 txs: 5 pts
   - 11–100 txs: 15 pts  
   - 101+ txs: 30 pts

2. **Contract Interactions (0–20 pts)**
   - Has interacted with smart contracts: +10
   - Interacted with known protocols (e.g., Uniswap): +10

3. **Wallet Age (0–20 pts)**
   - <1 month: 5 pts
   - 1–6 months: 10 pts
   - >6 months: 20 pts

4. **Token/NFT Diversity (0–10 pts)**
   - 1–2 assets: 2 pts
   - 3–10: 6 pts
   - >10: 10 pts

5. **Risk Signals (−10 to −30)**
   - Sudden large inflow/outflow: −10
   - Tornado Cash-related: −30
   - No activity at all: −20

**Trust Categories:**
- **Low Trust (<40)**: Fails CAPTCHA
- **Medium Trust (40–70)**: Hard CAPTCHA  
- **High Trust (70+)**: Simple/Skip CAPTCHA

#### Implementation Logic
```typescript
interface ReputationSystem {
  calculateWalletReputation: (address: string) => Promise<number>;
  normalizeScore: (rawScore: any) => number; // Scale to 0-100
  adjustCaptchaLogic: (score: number) => CaptchaMode;
}

interface CustomScoringAPI {
  fetchWalletData: (address: string) => Promise<WalletData>;
  calculateScore: (data: WalletData) => number;
  generateMockData: (address: string) => WalletData;
}

interface ReputationConfig {
  easyThreshold: number; // Default: 40
  bypassThreshold: number; // Default: 70
  weights: ScoringWeights;
}

interface ScoringWeights {
  transactionActivity: number; // Max 30 points
  contractInteractions: number; // Max 20 points
  walletAge: number; // Max 20 points
  tokenDiversity: number; // Max 10 points
  riskFlags: number; // Negative points
}

interface WalletData {
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

interface RiskFlag {
  type: 'tornado_cash' | 'large_inflow' | 'large_outflow' | 'no_activity';
  severity: number; // -10 to -30
  description: string;
}

// Example implementation
async function calculateWalletReputation(walletAddress: string): Promise<number> {
  const walletData = await fetchWalletData(walletAddress);
  return calculateScore(walletData);
}

function calculateScore(data: WalletData): number {
  let score = 0;
  
  // Transaction Activity (0-30 points)
  if (data.transactionCount >= 101) score += 30;
  else if (data.transactionCount >= 11) score += 15;
  else if (data.transactionCount > 0) score += 5;
  
  // Contract Interactions (0-20 points)
  if (data.contractInteractions > 0) score += 10;
  if (data.knownProtocolInteractions.length > 0) score += 10;
  
  // Wallet Age (0-20 points)
  const ageInMonths = data.walletAge / 30;
  if (ageInMonths >= 6) score += 20;
  else if (ageInMonths >= 1) score += 10;
  else score += 5;
  
  // Token/NFT Diversity (0-10 points)
  const totalAssets = data.tokenCount + data.nftCount;
  if (totalAssets > 10) score += 10;
  else if (totalAssets >= 3) score += 6;
  else if (totalAssets >= 1) score += 2;
  
  // Apply risk flags
  data.riskFlags.forEach(flag => {
    score += flag.severity; // Negative values
  });
  
  return Math.max(0, Math.min(100, score));
}

function determineCaptchaMode(score: number): CaptchaMode {
  if (score >= 70) return 'bypass'; // No CAPTCHA needed
  if (score >= 40) return 'simple';   // Simplified challenge
  return 'advanced';                   // Full validation required
}
```

#### Auto Mode Flow
1. **Fetch Wallet Address**: From wallet connection
2. **Calculate Custom Reputation Score**: Using onchain activity analysis
3. **Apply Scoring Formula**: Transaction activity + contract interactions + age + diversity - risk flags
4. **Adjust CAPTCHA Logic**:
   - Score ≥ 70: Skip CAPTCHA entirely (High Trust)
   - Score 40-69: Show simple challenge (Medium Trust)
   - Score < 40: Require full validation (Low Trust)

### Performance Considerations

- Lazy load step components to reduce initial bundle size
- Implement proper cleanup on component unmount
- Optimize re-renders with React.memo and useMemo
- Efficient drag-and-drop event handling
- Smooth 60fps animations using CSS transforms
- Cache reputation scores to avoid repeated API calls
- Implement fallback scoring when reputation services are unavailable

### Accessibility Features

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management when modal opens/closes
- Screen reader compatibility
- High contrast mode support

### Browser Compatibility

- Support modern browsers (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- Graceful degradation for older browsers
- Mobile browser optimization

## File Structure

```
/packages
├── /components
│   └── DeCapModal.jsx
├── /hooks
│   ├── useCaptchaLogic.js
│   └── useWalletReputation.js
├── /lib
│   ├── customScoring.ts (standalone reputation function)
│   └── reputation.ts (reputation system integration)
├── /utils
│   ├── verifySignature.js
│   ├── blockchainData.ts (Etherscan/Alchemy integration)
│   └── mockApi.ts (mock blockchain data for testing)
├── /config
│   └── decap.config.js (optional)
└── index.js
```

### Custom Scoring Implementation Strategy

The custom reputation scoring is implemented as an importable function that developers can use independently:

- **Standalone Function**: `calculateWalletReputation()` can be imported and used in any dapp
- **Mock Phase**: Uses mock blockchain data for development and testing
- **Production Phase**: Integrates with Etherscan API or Alchemy SDK for real onchain data
- **Atom Integration**: Designed to work as a state atom in React applications for reactive reputation updates

## Usage Example

```typescript
import { DeCap, calculateWalletReputation } from "decap-sdk"

// Use as standalone function (atom integration)
const reputationScore = await calculateWalletReputation(walletAddress);

// Use in component
function TransferButton() {
  return (
    <DeCap 
      mode="simple | advanced | auto"
      userWallet={wallet}
      onSuccess={(proof) => doTransaction(proof)}
      onFailure={() => alert("Verification failed")}
      className="btn"
    >
      Withdraw
    </DeCap>
  )
}

// Custom scoring configuration
const customConfig = {
  weights: {
    transactionActivity: 30,
    contractInteractions: 20,
    walletAge: 20,
    tokenDiversity: 10,
    riskFlags: -30
  },
  thresholds: {
    lowTrust: 40,
    highTrust: 70
  }
};
```