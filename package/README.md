# DeCap SDK

**Decentralized CAPTCHA for Web3 Applications**

A React component that provides intelligent CAPTCHA verification based on wallet reputation. High-reputation wallets skip verification entirely, while new wallets complete simple puzzles.

## Installation

```bash
npm install decap-sdk
# or
pnpm add decap-sdk
# or
yarn add decap-sdk
```

## Quick Start

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
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={() => console.log('Verification failed')}
    >
      <button>Protected Action</button>
    </DeCap>
  );
}
```

## Smart Verification

DeCap automatically adjusts verification based on wallet reputation:

- **High reputation (70-100)**: Skip verification entirely
- **Medium reputation (40-69)**: Simple puzzle
- **Low reputation (0-39)**: Puzzle + wallet signature

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

## Configuration

### Environment Setup

For reputation scoring, add your Etherscan API key:

```env
ETHERSCAN_API_KEY=your_api_key_here
```

Get a free API key at [etherscan.io/](https://etherscan.io/)

### Props

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

### Wallet Interface

```typescript
interface WalletConnection {
  address: string;
  signMessage: (message: string) => Promise<string>;
  isConnected: boolean;
}
```

Compatible with MetaMask, WalletConnect, Coinbase Wallet, and any ethers.js wallet.

## Themes

```typescript
<DeCap theme="light" {...props} />   // Light theme
<DeCap theme="dark" {...props} />    // Dark theme  
<DeCap theme="auto" {...props} />    // System preference
```

## Examples

Check the `/demo` folder for complete examples:
- Basic integration
- Reputation-based verification
- State management integration
- Custom scoring

## Documentation

- **[Technology Guide](./TECHNOLOGY.md)** - Technical details and architecture
- **[API Reference](./docs/REPUTATION_INTEGRATION.md)** - Advanced usage
- **[Etherscan Integration](./docs/ETHERSCAN_INTEGRATION.md)** - Blockchain data setup

## License

MIT License - see LICENSE file for details.