# DeCap SDK

**Decentralized CAPTCHA for Web3 Applications**

A React component that provides intelligent CAPTCHA verification based on wallet reputation. High-reputation wallets skip verification entirely, while new wallets complete simple puzzles or advanced verification with wallet signatures.

## Installation

```bash
npm install decap-sdk
# or
pnpm add decap-sdk
# or
yarn add decap-sdk
```

## Quick Start

### Simple Mode
Perfect for basic bot protection without wallet requirements:

```typescript
import { DeCap } from 'decap-sdk';

function App() {
  const handleSuccess = (proof) => {
    console.log('Verification successful:', proof);
    // Proceed with your protected action
  };

  return (
    <DeCap
      mode="simple"
      onSuccess={handleSuccess}
      onFailure={() => console.log('Verification failed')}
    >
      <button>Protected Action</button>
    </DeCap>
  );
}
```

### Advanced Mode
Enhanced security with wallet signature verification:

```typescript
import { DeCap } from 'decap-sdk';

function AdvancedProtection() {
  const handleSuccess = (proof) => {
    console.log('Verification successful:', proof);
    console.log('Wallet signature:', proof.walletSignature);
    // Verify signature on your backend for maximum security
  };

  return (
    <DeCap
      mode="advanced"
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={() => console.log('Verification failed')}
    >
      <button>High-Security Action</button>
    </DeCap>
  );
}
```

## Verification Modes

### 1. Simple Mode (`mode="simple"`)
- **Use case**: Basic bot protection, public actions
- **Requirements**: None (no wallet needed)
- **Process**: Interactive puzzle only
- **Security**: Medium - prevents automated bots

```typescript
<DeCap
  mode="simple"
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <button>Join Waitlist</button>
</DeCap>
```

### 2. Advanced Mode (`mode="advanced"`)
- **Use case**: High-value transactions, sensitive operations
- **Requirements**: Connected wallet
- **Process**: Interactive puzzle + wallet signature
- **Security**: High - cryptographic proof of ownership

```typescript
<DeCap
  mode="advanced"
  userWallet={wallet}
  onSuccess={(proof) => {
    // proof.walletSignature contains the cryptographic signature
    submitTransaction(proof.walletSignature);
  }}
  onFailure={handleFailure}
>
  <button>Execute Trade</button>
</DeCap>
```

### 3. Auto Mode (`mode="auto"`)
- **Use case**: Adaptive security based on user reputation
- **Requirements**: Wallet connection for reputation scoring
- **Process**: Automatically selects verification level
- **Security**: Dynamic - scales with user trustworthiness

```typescript
<DeCap
  mode="auto"
  userWallet={wallet}
  reputationScore={userReputation}
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <button>Smart Action</button>
</DeCap>
```

## Smart Verification with Auto Mode

DeCap automatically adjusts verification based on wallet reputation:

- **High reputation (70-100)**: Skip verification entirely ✨
- **Medium reputation (40-69)**: Simple puzzle only 🧩
- **Low reputation (0-39)**: Puzzle + wallet signature 🔐

```typescript
import { DeCap, fetchReputationScore } from 'decap-sdk';

function SmartVerification() {
  const [reputation, setReputation] = useState(null);
  
  useEffect(() => {
    if (wallet.address) {
      fetchReputationScore(wallet.address).then(setReputation);
    }
  }, [wallet.address]);

  return (
    <DeCap
      mode="auto"
      reputationScore={reputation?.score}
      userWallet={wallet}
      onSuccess={handleSuccess}
    >
      <button>Smart Protected Action</button>
    </DeCap>
  );
}
```

## Advanced Mode Security Features

### Wallet Signature Verification
Advanced mode generates a unique nonce message that users must sign:

```typescript
// Example signature message format:
// DeCap Verification
// Nonce: 550e8400-e29b-41d4-a716-446655440000
// Challenge: challenge_abc123
// Timestamp: 1703875200000
```

### Backend Verification
For maximum security, verify signatures on your backend:

```typescript
// Frontend
const handleSuccess = (proof) => {
  fetch('/api/verify-decap', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      signature: proof.walletSignature,
      address: wallet.address,
      challengeId: proof.challengeId,
      timestamp: proof.timestamp
    })
  });
};

// Backend (Node.js example)
import { ethers } from 'ethers';

app.post('/api/verify-decap', (req, res) => {
  const { signature, address, challengeId, timestamp } = req.body;
  
  // Reconstruct the original message
  const message = `DeCap Verification\nNonce: ${challengeId}\nTimestamp: ${timestamp}`;
  
  // Verify signature
  const recoveredAddress = ethers.utils.verifyMessage(message, signature);
  
  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    // Signature is valid, proceed with protected action
    res.json({ success: true });
  } else {
    res.status(400).json({ error: 'Invalid signature' });
  }
});
```

## Configuration

### Environment Setup

For reputation scoring in auto mode, add your Etherscan API key:

```env
ETHERSCAN_API_KEY=your_api_key_here
```

Get a free API key at [etherscan.io/](https://etherscan.io/)

### Props

```typescript
interface DeCapProps {
  mode: 'simple' | 'advanced' | 'auto';
  userWallet?: WalletConnection; // Optional for simple mode
  onSuccess: (proof: VerificationProof) => void;
  onFailure: () => void;
  children: React.ReactNode;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  reputationScore?: number; // For auto mode
}

interface VerificationProof {
  success: boolean;
  puzzleCompleted: boolean;
  walletSignature?: string; // Only present in advanced mode
  token: string;
  timestamp: number;
  challengeId: string;
  mode: 'simple' | 'advanced' | 'auto';
}
```

### Wallet Interface

```typescript
interface WalletConnection {
  address: string;
  signMessage: (message: string) => Promise<string>;
  isConnected: boolean;
}
```

Compatible with MetaMask, WalletConnect, Coinbase Wallet, and any ethers.js wallet.

## Use Cases by Mode

### Simple Mode Examples
- Newsletter signups
- Public content access
- Basic form submissions
- Community features

### Advanced Mode Examples
- Financial transactions
- NFT minting/trading
- Governance voting
- Account modifications
- High-value operations

### Auto Mode Examples
- DeFi protocols
- Social platforms
- Gaming applications
- Multi-tier access systems

## Themes

```typescript
<DeCap theme="light" {...props} />   // Light theme
<DeCap theme="dark" {...props} />    // Dark theme  
<DeCap theme="auto" {...props} />    // System preference
```

## Examples

Check the `/demo` folder for complete examples:
- Basic integration (simple mode)
- Advanced security (advanced mode)
- Reputation-based verification (auto mode)
- State management integration
- Custom scoring
- Backend signature verification

## Documentation

- **[Technology Guide](./TECHNOLOGY.md)** - Technical details and architecture
- **[API Reference](./docs/REPUTATION_INTEGRATION.md)** - Advanced usage
- **[Etherscan Integration](./docs/ETHERSCAN_INTEGRATION.md)** - Blockchain data setup

## License

MIT License - see LICENSE file for details.

Contribute on [GitHub](https://github.com/emma31-dev/decaptcha-pkg).
