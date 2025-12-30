# DeCap SDK

**Decentralized CAPTCHA for Web3 Applications**

DeCap is a React component that provides intelligent CAPTCHA verification based on wallet reputation. It offers three verification modes: simple puzzles for basic bot protection, advanced verification with wallet signatures for high-security operations, and automatic mode selection based on user reputation.

## Installation

```bash
npm install decap-sdk
# or
pnpm add decap-sdk
# or
yarn add decap-sdk
```

## Usage

### Simple Mode
Basic bot protection without wallet requirements:

```typescript
import { DeCap } from 'decap-sdk';

function App() {
  return (
    <DeCap
      mode="simple"
      onSuccess={(proof) => console.log('Verified!', proof)}
      onFailure={() => console.log('Failed')}
    >
      <button>Protected Action</button>
    </DeCap>
  );
}
```

**Props:**
- `mode`: `"simple"`
- `onSuccess`: `(proof: VerificationProof) => void`
- `onFailure`: `() => void`
- `children`: React element to wrap
- `theme?`: `"light" | "dark" | "auto"` (optional)

### Advanced Mode
Enhanced security with cryptographic wallet signatures:

```typescript
import { DeCap } from 'decap-sdk';

function SecureApp() {
  return (
    <DeCap
      mode="advanced"
      userWallet={wallet}
      onSuccess={(proof) => {
        console.log('Verified with signature:', proof.walletSignature);
        // Verify signature on your backend for maximum security
      }}
      onFailure={() => console.log('Verification failed')}
    >
      <button>High-Security Action</button>
    </DeCap>
  );
}
```

**Props:**
- `mode`: `"advanced"`
- `userWallet`: `WalletConnection` (required)
- `onSuccess`: `(proof: VerificationProof) => void`
- `onFailure`: `() => void`
- `children`: React element to wrap
- `theme?`: `"light" | "dark" | "auto"` (optional)

### Auto Mode ⚠️ (Experimental)
Adaptive verification based on wallet reputation:

```typescript
import { DeCap } from 'decap-sdk';

function SmartApp() {
  return (
    <DeCap
      mode="auto"
      userWallet={wallet}
      reputationScore={userReputation}
      onSuccess={(proof) => console.log('Smart verification:', proof)}
      onFailure={() => console.log('Failed')}
    >
      <button>Adaptive Action</button>
    </DeCap>
  );
}
```

**Props:**
- `mode`: `"auto"`
- `userWallet`: `WalletConnection` (required)
- `reputationScore?`: `number` (0-100, optional)
- `onSuccess`: `(proof: VerificationProof) => void`
- `onFailure`: `() => void`
- `children`: React element to wrap
- `theme?`: `"light" | "dark" | "auto"` (optional)

**⚠️ Auto Mode Status:** Currently experimental. Reputation scoring is under active development and may not be fully reliable. Use `simple` or `advanced` modes for production applications.

## Reputation Score Integration

DeCap provides powerful reputation scoring functions that you can use independently in your application for wallet analysis, risk assessment, and custom verification logic.

### Basic Reputation Fetching

```typescript
import { fetchReputationScore } from 'decap-sdk';

// Simple reputation fetch (uses fallback data if no API key)
const reputation = await fetchReputationScore('0x742d35Cc6634C0532925a3b8D');
console.log(reputation.score); // 0-100
console.log(reputation.trustLevel); // 'low' | 'medium' | 'high'
console.log(reputation.captchaMode); // 'advanced' | 'simple' | 'bypass'

// Production usage with Etherscan API
const reputation = await fetchReputationScore('0x742d35Cc6634C0532925a3b8D', {
  apiKey: process.env.ETHERSCAN_API_KEY
});
```

### Advanced Reputation Functions

```typescript
import { 
  fetchReputationScore,
  batchFetchWalletReputation,
  getCaptchaModeFromScore,
  getTrustLevelFromScore,
  calculateWalletReputation,
  clearCache
} from 'decap-sdk';

// Batch analyze multiple wallets
const wallets = ['0x123...', '0x456...', '0x789...'];
const reputations = await batchFetchWalletReputation(wallets, {
  apiKey: process.env.ETHERSCAN_API_KEY
});

// Direct score calculation with custom config
const score = await calculateWalletReputation('0x123...', {
  easyThreshold: 50,
  bypassThreshold: 80,
  weights: {
    transactionActivity: 0.3,
    contractInteractions: 0.25,
    walletAge: 0.2,
    tokenDiversity: 0.15,
    riskFlags: 0.1
  }
});

// Utility functions for score analysis
const trustLevel = getTrustLevelFromScore(75); // 'high'
const captchaMode = getCaptchaModeFromScore(45); // 'simple'

// Clear reputation cache when needed
clearCache();
```

### React Hook Integration

```typescript
import { useWalletReputation } from 'decap-sdk';

function WalletAnalyzer({ walletAddress }: { walletAddress: string }) {
  const {
    reputationData,
    isLoading,
    error,
    getRecommendedMode,
    fetchReputation,
    refreshReputation
  } = useWalletReputation({
    walletAddress,
    bypassThreshold: 70,
    easyThreshold: 40,
    autoFetch: true
  });

  if (isLoading) return <div>Analyzing wallet...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!reputationData) return <div>No data</div>;

  return (
    <div>
      <h3>Wallet Reputation: {reputationData.score}/100</h3>
      <p>Trust Level: {reputationData.trustLevel}</p>
      <p>Recommended CAPTCHA: {getRecommendedMode() || 'None needed'}</p>
      <button onClick={refreshReputation}>Refresh</button>
    </div>
  );
}
```

### State Management Integration

```typescript
// With Zustand
import { create } from 'zustand';
import { fetchReputationScore, ReputationResult } from 'decap-sdk';

interface ReputationStore {
  reputations: Record<string, ReputationResult>;
  fetchReputation: (address: string) => Promise<void>;
}

const useReputationStore = create<ReputationStore>((set, get) => ({
  reputations: {},
  fetchReputation: async (address: string) => {
    const reputation = await fetchReputationScore(address, {
      apiKey: process.env.ETHERSCAN_API_KEY
    });
    set(state => ({
      reputations: { ...state.reputations, [address]: reputation }
    }));
  }
}));

// With Jotai
import { atom } from 'jotai';
import { fetchReputationScore } from 'decap-sdk';

const walletAddressAtom = atom<string>('');
const reputationAtom = atom(async (get) => {
  const address = get(walletAddressAtom);
  if (!address) return null;
  return await fetchReputationScore(address);
});
```

### Custom Scoring Configuration

```typescript
import { calculateWalletReputation, ReputationConfig } from 'decap-sdk';

const customConfig: ReputationConfig = {
  easyThreshold: 50,    // Simple CAPTCHA threshold
  bypassThreshold: 80,  // Skip CAPTCHA threshold
  weights: {
    transactionActivity: 0.35,     // Transaction count & volume
    contractInteractions: 0.25,    // Smart contract usage
    walletAge: 0.20,              // Account age
    tokenDiversity: 0.15,         // Token variety
    riskFlags: 0.05               // Risk indicators
  }
};

const score = await calculateWalletReputation(
  '0x742d35Cc6634C0532925a3b8D',
  customConfig,
  process.env.ETHERSCAN_API_KEY
);
```

### Reputation Result Interface

```typescript
interface ReputationResult {
  score: number;                              // 0-100 reputation score
  trustLevel: 'low' | 'medium' | 'high';    // Trust classification
  captchaMode: 'advanced' | 'simple' | 'bypass'; // Recommended CAPTCHA
  walletData: WalletData;                    // Detailed wallet analysis
  dataSource: 'etherscan' | 'mock' | 'fallback'; // Data source used
  timestamp: number;                         // When calculated
}
```

## Configuration

### Setup Configuration File

Create a `decap.config.js` file in your project root:

```javascript
module.exports = {
  // Etherscan API Configuration
  etherscan: {
    // Get your free API key from https://etherscan.io/apis
    apiKey: process.env.ETHERSCAN_API_KEY || 'YourEtherscanApiKeyHere',
    network: 'mainnet',
    timeout: 10000
  },

  // Reputation Scoring Configuration (for auto mode)
  reputation: {
    thresholds: {
      bypass: 70,  // Skip verification entirely
      simple: 40,  // Simple puzzle only
      advanced: 0  // Puzzle + wallet signature
    },
    cache: {
      ttl: 300000,     // 5 minutes
      maxEntries: 1000
    }
  },

  // UI/UX Settings
  ui: {
    defaultTheme: 'auto',
    animations: { enabled: true, duration: 300 },
    modal: {
      closeOnOverlayClick: false,
      showCloseButton: true,
      autoCloseDelay: 2000
    }
  },

  // Development Settings
  development: {
    debug: process.env.NODE_ENV === 'development',
    useMockData: !process.env.ETHERSCAN_API_KEY
  }
};
```

### Environment Variables

```env
ETHERSCAN_API_KEY=your_api_key_here
NODE_ENV=development
```

### Runtime Configuration

```typescript
import { updateConfig } from 'decap-sdk';

// Update configuration at runtime
updateConfig({
  etherscan: { apiKey: 'new-api-key' },
  development: { debug: true }
});
```

## Technology Stack

- **React** - UI framework
- **TypeScript** - Type safety and developer experience
- **CSS Variables** - Dynamic theming system
- **Ethers.js** - Ethereum wallet integration
- **Crypto API** - Secure nonce generation
- **Portal Rendering** - Modal overlay management
- **Flexbox/Grid** - Responsive layout system

## Contribute

Check out our repository to get started:

**[🚀 Contribute to DeCap SDK](https://github.com/emma31-dev/decaptcha-pkg)**

- Report bugs and request features
- Submit pull requests
- Improve documentation
- Share feedback and ideas

## License

MIT License - see LICENSE file for details.