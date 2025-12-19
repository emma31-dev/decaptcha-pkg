# DeCap SDK - Technology Guide

## Architecture Overview

DeCap SDK is built as a modular React component library that provides decentralized CAPTCHA verification for Web3 applications. The system combines traditional CAPTCHA mechanisms with blockchain-based reputation scoring to create an intelligent verification system.

## Core Components

### 1. DeCap Component (`src/components/DeCap.tsx`)

The main React component that orchestrates the entire verification flow:

```typescript
interface DeCapProps {
  mode: 'simple' | 'advanced' | 'auto';
  userWallet: WalletConnection;
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  reputationScore?: number;
}
```

**Key Features:**
- Conditional rendering based on reputation scores
- Theme system integration
- Wallet signature verification
- Challenge generation and validation

### 2. Reputation System (`src/lib/reputation.ts`)

Blockchain-based wallet analysis that calculates trust scores:

```typescript
interface ReputationScore {
  score: number;           // 0-100 reputation score
  trustLevel: 'low' | 'medium' | 'high';
  transactionCount: number;
  accountAge: number;      // Days since first transaction
  averageValue: number;    // Average transaction value in ETH
  uniqueInteractions: number;
}
```

**Scoring Algorithm:**
- **Transaction History (40%)**: Volume and frequency of transactions
- **Account Age (25%)**: Time since first transaction
- **Network Activity (20%)**: Unique contract interactions
- **Value Patterns (15%)**: Average transaction values and consistency

### 3. Challenge System (`src/lib/challenge.ts`)

Generates cryptographically secure challenges for verification:

```typescript
interface Challenge {
  id: string;
  type: 'puzzle' | 'signature' | 'hybrid';
  difficulty: number;
  nonce: string;
  timestamp: number;
  expiresAt: number;
}
```

**Challenge Types:**
- **Puzzle**: Visual or logical puzzles (drag-and-drop, pattern matching)
- **Signature**: Wallet message signing with nonce verification
- **Hybrid**: Combination of puzzle + signature for low-reputation wallets

### 4. Signature Verification (`src/lib/signature.ts`)

Handles cryptographic verification of wallet signatures:

```typescript
interface SignatureVerification {
  message: string;
  signature: string;
  address: string;
  nonce: string;
  timestamp: number;
}
```

**Security Features:**
- Nonce-based replay attack prevention
- Timestamp validation with configurable expiry
- Message tampering detection
- ethers.js integration for signature recovery

## Hooks System

### useCaptcha Hook (`src/hooks/useCaptcha.ts`)

Main hook that manages the verification state:

```typescript
interface CaptchaState {
  isLoading: boolean;
  isVerified: boolean;
  challenge: Challenge | null;
  reputation: ReputationScore | null;
  error: string | null;
}
```

### useWalletReputation Hook (`src/hooks/useWalletReputation.ts`)

Manages reputation fetching and caching:

```typescript
interface ReputationHook {
  reputation: ReputationScore | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}
```

## Theme System (`src/themes/`)

CSS-in-JS theme system with support for:
- Light/dark mode switching
- System preference detection
- Custom theme variables
- Component-level theme overrides

```typescript
interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    border: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}
```

## Utilities

### Etherscan API Integration (`src/utils/etherscanApi.ts`)

Fetches blockchain data for reputation calculation:

```typescript
interface EtherscanConfig {
  apiKey: string;
  network?: 'mainnet' | 'goerli' | 'sepolia';
  timeout?: number;
  retries?: number;
}
```

**Data Sources:**
- Transaction history
- Contract interactions
- Token transfers
- Account balance history

### UUID Generation (`src/utils/uuid.ts`)

Cryptographically secure UUID generation for challenges and nonces.

### Reputation Utils (`src/utils/reputationUtils.ts`)

Helper functions for reputation score calculation and caching.

## Security Considerations

### 1. Nonce Management
- Cryptographically secure random nonce generation
- Server-side nonce validation (recommended)
- Automatic nonce expiry (default: 5 minutes)

### 2. Signature Security
- Message format standardization
- Signature recovery and address verification
- Timestamp-based replay protection

### 3. API Security
- Rate limiting on reputation API calls
- API key validation
- Error handling without information leakage

### 4. Client-Side Protection
- Input sanitization
- XSS prevention
- CSRF token integration (when used with forms)

## Performance Optimizations

### 1. Lazy Loading
- Dynamic imports for challenge components
- Conditional reputation fetching
- Theme system code splitting

### 2. Caching Strategy
- Reputation score caching (default: 1 hour)
- Challenge result memoization
- Theme preference persistence

### 3. Bundle Optimization
- Tree-shaking support
- Minimal dependencies
- Gzip compression (target: <20KB)

## State Management Integration

### Jotai Integration

```typescript
import { atom, useAtom } from 'jotai';
import { fetchReputationScore } from 'decap-sdk';

const reputationAtom = atom<ReputationScore | null>(null);
const walletAtom = atom<WalletConnection | null>(null);

export const useDeCapState = () => {
  const [reputation, setReputation] = useAtom(reputationAtom);
  const [wallet] = useAtom(walletAtom);
  
  const fetchReputation = useCallback(async () => {
    if (wallet?.address) {
      const score = await fetchReputationScore(wallet.address);
      setReputation(score);
    }
  }, [wallet?.address, setReputation]);
  
  return { reputation, fetchReputation };
};
```

### Redux Integration

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchReputationScore } from 'decap-sdk';

export const fetchWalletReputation = createAsyncThunk(
  'decap/fetchReputation',
  async (address: string, { rejectWithValue }) => {
    try {
      return await fetchReputationScore(address);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const decapSlice = createSlice({
  name: 'decap',
  initialState: {
    reputation: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearReputation: (state) => {
      state.reputation = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletReputation.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchWalletReputation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reputation = action.payload;
      })
      .addCase(fetchWalletReputation.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});
```

## Custom Scoring Implementation

### Custom Scoring Function (`src/lib/customScoring.ts`)

Allows developers to implement custom reputation algorithms:

```typescript
interface CustomScoringConfig {
  weights: {
    transactionCount: number;
    accountAge: number;
    averageValue: number;
    uniqueInteractions: number;
  };
  thresholds: {
    highTrust: number;
    mediumTrust: number;
  };
  customFactors?: (data: WalletData) => number;
}

export const calculateCustomScore = (
  walletData: WalletData,
  config: CustomScoringConfig
): ReputationScore => {
  // Custom scoring implementation
};
```

## Testing Strategy

### Unit Tests
- Component rendering tests
- Hook behavior validation
- Utility function testing
- Signature verification tests

### Integration Tests
- End-to-end verification flows
- Wallet integration testing
- API integration validation
- Theme switching tests

### Performance Tests
- Bundle size validation
- Rendering performance
- Memory usage monitoring
- API response time testing

## Build System

### TypeScript Configuration
- Strict type checking
- Path mapping for clean imports
- Declaration file generation
- Source map support

### Build Pipeline (tsup)
- ESM and CJS output formats
- TypeScript declaration files
- CSS processing and minification
- Tree-shaking optimization

### Development Tools
- Hot module replacement
- Type checking in watch mode
- Linting with ESLint
- Formatting with Prettier

## Deployment Considerations

### NPM Package Structure
```
dist/
├── index.js          # CommonJS entry
├── index.mjs         # ESM entry
├── index.d.ts        # TypeScript declarations
├── themes/           # Theme system
├── utils/            # Utility functions
└── components/       # React components
```

### Peer Dependencies
- React >=16.8.0 (hooks support)
- ethers ^6.0.0 (signature verification)
- react-dom >=16.8.0 (DOM manipulation)

### Browser Support
- Modern browsers with ES2020 support
- Web3 wallet compatibility
- Mobile wallet app integration

## Future Enhancements

### Planned Features
1. **Multi-chain Support**: Extend beyond Ethereum
2. **Advanced Challenges**: Biometric verification, device fingerprinting
3. **ML-based Scoring**: Machine learning reputation models
4. **Decentralized Storage**: IPFS integration for challenge data
5. **Zero-Knowledge Proofs**: Privacy-preserving verification

### API Stability
- Semantic versioning
- Backward compatibility guarantees
- Migration guides for breaking changes
- Deprecation warnings and timelines