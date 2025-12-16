# DeCap SDK

🔐 **Decentralized CAPTCHA SDK for Web3 Applications**

A modern, lightweight SDK that provides human verification through interactive puzzles and optional wallet signing. Built for Web3 applications with reputation-based verification flows and comprehensive theme support.

## ✨ Features

- 🧩 **Interactive Letter Puzzles**: Smooth drag-and-drop CAPTCHA challenges
- 🔐 **Wallet Integration**: SIWE-style signature verification with Ethers.js
- 🎯 **Multiple Modes**: Simple, Advanced, and Auto (reputation-based)
- 🍊 **Orange Protocol Integration**: Onchain reputation scoring with mock API
- 🎨 **Theme Support**: Light, dark, and auto themes with dapp integration
- 📱 **Mobile Optimized**: Haptic feedback and responsive design
- ⚡ **Performance Optimized**: Hardware-accelerated animations and caching
- 🎭 **Apple-Inspired UI**: Clean, modern interface with smooth SVG animations
- 🪶 **Lightweight**: Minimal bundle size with tree-shaking support
- ♿ **Accessible**: Screen reader support and reduced motion preferences

## 📦 Installation

```bash
pnpm add decap-sdk ethers
# or
npm install decap-sdk ethers
# or  
yarn add decap-sdk ethers
```

## 🚀 Quick Start

```tsx
import { DeCap } from 'decap-sdk';

function TransferButton() {
  const wallet = {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    signMessage: async (message: string) => {
      // Your wallet signing logic (MetaMask, WalletConnect, etc.)
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, address],
      });
    },
    isConnected: true,
  };

  return (
    <DeCap
      mode="simple"
      userWallet={wallet}
      theme="light"
      onSuccess={(proof) => {
        console.log('✅ Verification successful:', proof);
        // Proceed with your transaction
        executeTransaction(proof.token);
      }}
      onFailure={() => {
        console.log('❌ Verification failed');
        // Handle failure
      }}
    >
      <button className="transfer-btn">
        Send Transaction
      </button>
    </DeCap>
  );
}
```

## 🎯 Verification Modes

### 🟢 Simple Mode
- **Flow**: Puzzle → Success (2 pages)
- **Requirements**: Letter puzzle completion only
- **Use Case**: Low-risk transactions, basic bot protection
- **Duration**: ~10-15 seconds

```tsx
<DeCap mode="simple" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Quick Verify</button>
</DeCap>
```

### 🔵 Advanced Mode  
- **Flow**: Puzzle → Wallet Sign → Success (3 pages)
- **Requirements**: Puzzle + SIWE signature verification
- **Use Case**: High-value transactions, enhanced security
- **Duration**: ~20-30 seconds

```tsx
<DeCap mode="advanced" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Secure Verify</button>
</DeCap>
```

### 🟡 Auto Mode (Reputation-Based)
- **Flow**: Dynamic based on onchain reputation
- **Logic**: 
  - Score >70: Skip CAPTCHA entirely
  - Score >50: Simple mode
  - Score <50: Advanced mode
- **Use Case**: Adaptive UX based on user trust level

```tsx
<DeCap mode="auto" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Smart Verify</button>
</DeCap>
```

## 🎨 Theme Support

### Light Theme (Default)
```tsx
<DeCap theme="light" mode="simple" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Verify</button>
</DeCap>
```

### Dark Theme
```tsx
<DeCap theme="dark" mode="simple" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Verify</button>
</DeCap>
```

### Auto Theme (Dapp Integration)
```tsx
import { useTheme } from 'your-dapp-theme-provider';

function MyComponent() {
  const { theme } = useTheme(); // Returns 'light' | 'dark'
  
  return (
    <DeCap 
      theme="auto" 
      useTheme={() => theme}
      mode="simple" 
      userWallet={wallet} 
      onSuccess={handleSuccess} 
      onFailure={handleFailure}
    >
      <button>Verify</button>
    </DeCap>
  );
}
```

## 🍊 Orange Protocol Integration

The SDK includes built-in Orange Protocol integration for reputation-based verification:

```tsx
// Auto mode automatically queries Orange Protocol
<DeCap mode="auto" userWallet={wallet} onSuccess={handleSuccess} onFailure={handleFailure}>
  <button>Reputation-Based Verify</button>
</DeCap>
```

### Reputation Scoring
- **Social Network Data**: Twitter, Discord, Google, Telegram accounts
- **Proof of Humanity**: BrightID, Worldcoin, Gitcoin verifications  
- **ENS Domains**: Owned .eth domains
- **Account Age**: Platform join dates and activity
- **Follower Metrics**: Social media engagement

### Mock API (Development)
The SDK includes a high-performance mock Orange Protocol API for development and testing:

```js
import { createSampleOrangeInput, fetchOrangeReputationScore } from 'decap-sdk/utils';

// Generate sample data
const sampleData = createSampleOrangeInput();

// Get reputation score
const score = await fetchOrangeReputationScore(sampleData);
console.log('Reputation score:', score); // 0-100
```

## ⚙️ Props & Configuration

### Component Props

```tsx
interface DeCapProps {
  // Required Props
  mode: 'simple' | 'advanced' | 'auto';
  userWallet: WalletConnection;
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  children: React.ReactNode;
  
  // Optional Props
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  useTheme?: () => 'light' | 'dark';
}
```

### Required Props

#### `mode: 'simple' | 'advanced' | 'auto'`
Determines the verification flow complexity:
- **`'simple'`**: Puzzle only (2 steps: Puzzle → Success)
- **`'advanced'`**: Puzzle + wallet signing (3 steps: Puzzle → Sign → Success)  
- **`'auto'`**: Uses reputation score to determine flow automatically

#### `userWallet: WalletConnection`
Wallet connection object for signing operations:
```tsx
interface WalletConnection {
  address: string;                              // User's wallet address
  signMessage: (message: string) => Promise<string>; // Message signing function
  isConnected: boolean;                         // Connection status
}
```

#### `onSuccess: (proof: VerificationProof) => void`
Callback fired when verification completes successfully:
```tsx
interface VerificationProof {
  success: boolean;           // Always true for onSuccess
  puzzleCompleted: boolean;   // Puzzle completion status
  walletSignature?: string;   // Signature (advanced mode only)
  token: string;             // Unique verification token
  timestamp: number;         // Completion timestamp
  challengeId: string;       // Challenge identifier
  mode: 'simple' | 'advanced' | 'auto'; // Mode used
}
```

#### `onFailure: () => void`
Callback fired when verification fails or is cancelled.

#### `children: React.ReactNode`
The trigger element that opens the verification modal when clicked.

### Optional Props

#### `className?: string`
CSS class name applied to the trigger element wrapper.

#### `theme?: 'light' | 'dark' | 'auto'`
Visual theme for the modal:
- **`'light'`**: Light theme (default)
- **`'dark'`**: Dark theme
- **`'auto'`**: Uses `useTheme` hook to detect theme

#### `useTheme?: () => 'light' | 'dark'`
Hook function for auto theme detection. Required when `theme="auto"`.

## 📖 Usage Examples

### Basic Usage

```tsx
import { DeCap } from 'decap-sdk';

function MyComponent() {
  const wallet = {
    address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    signMessage: async (message: string) => {
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, wallet.address],
      });
    },
    isConnected: true,
  };

  const handleSuccess = (proof) => {
    console.log('Verification successful!', proof);
    // Proceed with your protected action
    executeTransaction(proof.token);
  };

  const handleFailure = () => {
    console.log('Verification failed or cancelled');
    // Handle failure case
  };

  return (
    <DeCap
      mode="simple"
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    >
      <button className="verify-btn">
        Click to Verify
      </button>
    </DeCap>
  );
}
```

### Advanced Mode with Wallet Signing

```tsx
<DeCap
  mode="advanced"
  userWallet={wallet}
  onSuccess={(proof) => {
    console.log('Wallet signature:', proof.walletSignature);
    // Use both puzzle completion and wallet signature
    submitSecureTransaction(proof);
  }}
  onFailure={handleFailure}
>
  <button className="secure-action-btn">
    Secure Transaction
  </button>
</DeCap>
```

### Auto Mode with Reputation

```tsx
<DeCap
  mode="auto"
  userWallet={wallet}
  onSuccess={(proof) => {
    console.log(`Completed in ${proof.mode} mode`);
    // Mode will be determined by user's reputation score
  }}
  onFailure={handleFailure}
>
  <button className="smart-verify-btn">
    Smart Verification
  </button>
</DeCap>
```

### Dark Theme

```tsx
<DeCap
  mode="simple"
  theme="dark"
  userWallet={wallet}
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <button className="dark-theme-btn">
    Verify (Dark Mode)
  </button>
</DeCap>
```

### Auto Theme with Hook Integration

```tsx
import { useTheme } from 'your-theme-provider';

function ThemedComponent() {
  const { theme } = useTheme(); // Returns 'light' | 'dark'
  
  return (
    <DeCap
      mode="simple"
      theme="auto"
      useTheme={() => theme}
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    >
      <button>Verify (Auto Theme)</button>
    </DeCap>
  );
}
```

### Custom Styling

```tsx
<DeCap
  mode="simple"
  className="my-custom-wrapper"
  userWallet={wallet}
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <div className="custom-trigger">
    <span>🔐</span>
    <span>Verify Identity</span>
  </div>
</DeCap>
```

### Error Handling

```tsx
<DeCap
  mode="advanced"
  userWallet={wallet}
  onSuccess={(proof) => {
    // Validate proof on your backend
    validateProof(proof)
      .then(() => proceedWithAction())
      .catch(() => showError('Verification failed'));
  }}
  onFailure={() => {
    // Handle various failure scenarios
    showNotification('Verification was cancelled or failed');
  }}
>
  <button>Protected Action</button>
</DeCap>
```

## 📊 Verification Proof

The `onSuccess` callback receives a comprehensive verification proof:

```tsx
interface VerificationProof {
  success: boolean;
  puzzleCompleted: boolean;
  walletSignature?: string; // Only in advanced mode
  token: string; // Unique verification token
  timestamp: number;
  challengeId: string;
  mode: 'simple' | 'advanced' | 'auto';
}

// Example usage
const handleSuccess = (proof: VerificationProof) => {
  // Verify the proof on your backend
  const isValid = await verifyProofOnBackend(proof);
  
  if (isValid) {
    // Proceed with transaction
    await executeTransaction({
      verificationToken: proof.token,
      signature: proof.walletSignature,
    });
  }
};
```

## 🔧 Wallet Integration

### MetaMask Integration
```tsx
const wallet = {
  address: accounts[0],
  signMessage: async (message: string) => {
    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, accounts[0]],
    });
  },
  isConnected: !!accounts[0],
};
```

### WalletConnect Integration
```tsx
import { useWalletConnect } from '@walletconnect/react';

const { account, signMessage } = useWalletConnect();

const wallet = {
  address: account,
  signMessage: async (message: string) => {
    return await signMessage(message);
  },
  isConnected: !!account,
};
```

### Ethers.js Integration
```tsx
import { ethers } from 'ethers';

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();

const wallet = {
  address: await signer.getAddress(),
  signMessage: async (message: string) => {
    return await signer.signMessage(message);
  },
  isConnected: true,
};
```

## 🔐 Security Features

### UUID-Based Nonce Generation
The SDK uses cryptographically secure UUID v4 for nonce generation in wallet signing:

```tsx
import { generateSecureNonce, generateUUID } from 'decap-sdk';

// Generate secure nonce for signing
const nonce = generateSecureNonce(); // UUID + timestamp
// Example: "550e8400-e29b-41d4-a716-446655440000-1k2j3h4g"

// Generate standard UUID
const uuid = generateUUID(); // Standard UUID v4
// Example: "550e8400-e29b-41d4-a716-446655440000"
```

### Message Format
Wallet signing uses SIWE-style messages with UUID nonces:
```
decap.app wants you to sign in with your Ethereum account:
0x742d35Cc6634C0532925a3b8D4C9db96590c6C87

Sign this message to complete DeCap verification.

URI: https://decap.app
Version: 1
Chain ID: 1
Nonce: 550e8400-e29b-41d4-a716-446655440000-1k2j3h4g
Issued At: 2024-01-15T10:30:00.000Z
Request ID: challenge_abc123
```

## 🧪 Testing

### Run Tests
```bash
pnpm test
# or
npm test
```

### Test Coverage
```bash
pnpm test:coverage
# or  
npm run test:coverage
```

### Example Test
```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { DeCap } from 'decap-sdk';

test('should complete simple verification flow', async () => {
  const mockWallet = {
    address: '0x123...',
    signMessage: jest.fn().mockResolvedValue('0xsignature...'),
    isConnected: true,
  };

  const onSuccess = jest.fn();
  const onFailure = jest.fn();

  render(
    <DeCap mode="simple" userWallet={mockWallet} onSuccess={onSuccess} onFailure={onFailure}>
      <button>Verify</button>
    </DeCap>
  );

  // Click to open modal
  fireEvent.click(screen.getByText('Verify'));
  
  // Complete puzzle (implementation depends on test setup)
  // ...
  
  expect(onSuccess).toHaveBeenCalledWith(
    expect.objectContaining({
      success: true,
      puzzleCompleted: true,
      mode: 'simple',
    })
  );
});
```

## 🛠️ Development

### Setup
```bash
# Clone repository
git clone https://github.com/your-org/decap-sdk.git
cd decap-sdk/package

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open test page
open http://localhost:3000
```

### Build
```bash
# Build for production
pnpm build

# Check bundle size
pnpm analyze

# Type check
pnpm type-check

# Lint code
pnpm lint
```

### Project Structure
```
package/
├── src/
│   ├── components/          # React components
│   │   ├── DeCap.tsx       # Main component
│   │   └── DeCap.css       # Styles
│   ├── hooks/              # React hooks
│   ├── lib/                # Core utilities
│   │   ├── challenge.ts    # Puzzle generation
│   │   ├── reputation.ts   # Reputation system
│   │   └── signature.ts    # Wallet signing
│   ├── utils/              # Helper utilities
│   │   ├── orangeProtocol.ts    # Orange Protocol mock API
│   │   ├── fetchOrangeScore.js  # Reputation fetching
│   │   └── verifySignature.js   # Signature verification
│   ├── themes/             # Theme system
│   └── types/              # TypeScript definitions
├── dev/                    # Development playground
├── test/                   # Test files
└── dist/                   # Built package
```

## 📈 Performance

### Bundle Size
- **Core**: ~15KB gzipped
- **With Ethers.js**: ~45KB gzipped (peer dependency)
- **Tree-shakeable**: Import only what you need

### Optimizations
- ⚡ Hardware-accelerated animations
- 🧠 In-memory reputation caching
- 🎯 Lazy component loading
- 📱 Mobile-optimized touch handling
- 🔄 Efficient re-rendering with React.memo

### Browser Support
- ✅ Chrome 90+
- ✅ Firefox 88+  
- ✅ Safari 14+
- ✅ Edge 90+
- 📱 Mobile browsers (iOS Safari, Chrome Mobile)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `pnpm test`
6. Commit changes: `git commit -m 'Add amazing feature'`
7. Push to branch: `git push origin feature/amazing-feature`
8. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Documentation**: [https://decap-sdk.dev](https://decap-sdk.dev)
- **GitHub**: [https://github.com/your-org/decap-sdk](https://github.com/your-org/decap-sdk)
- **NPM**: [https://www.npmjs.com/package/decap-sdk](https://www.npmjs.com/package/decap-sdk)
- **Discord**: [https://discord.gg/decap](https://discord.gg/decap)

---

**Built with ❤️ for the Web3 community**