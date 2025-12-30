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