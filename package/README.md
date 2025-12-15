# DeCap SDK

Decentralized CAPTCHA SDK for Web3 applications. Provides human verification through interactive puzzles and optional wallet signing.

## Features

- 🧩 **Interactive Letter Puzzles**: Drag-and-drop CAPTCHA challenges
- 🔐 **Wallet Integration**: Optional signature verification with Ethers.js
- 🎯 **Multiple Modes**: Simple, Advanced, and Auto (reputation-based)
- 📱 **Mobile Optimized**: Haptic feedback and responsive design
- 🎨 **Apple-Inspired UI**: Clean, modern interface with smooth animations
- ⚡ **Lightweight**: Minimal bundle size with tree-shaking support

## Installation

```bash
pnpm add decap-sdk ethers
```

## Quick Start

```tsx
import { DeCap } from 'decap-sdk';

function TransferButton() {
  const wallet = {
    address: '0x...',
    signMessage: async (message: string) => {
      // Your wallet signing logic
      return signature;
    },
    isConnected: true,
  };

  return (
    <DeCap
      mode="simple"
      userWallet={wallet}
      onSuccess={(proof) => {
        console.log('Verification successful:', proof);
        // Proceed with your transaction
      }}
      onFailure={() => {
        console.log('Verification failed');
      }}
    >
      <button>Send Transaction</button>
    </DeCap>
  );
}
```

## Modes

### Simple Mode
- Only requires puzzle completion
- No wallet signing
- 2 pages: Puzzle → Success

### Advanced Mode  
- Requires puzzle + wallet signature
- Full verification flow
- 3 pages: Puzzle → Wallet Sign → Success

### Auto Mode
- Uses onchain reputation to determine flow
- High reputation (>70): Skip CAPTCHA
- Medium reputation (>50): Simple mode
- Low reputation (<50): Advanced mode

## Configuration

Create a `decap.config.js` file for gas payment setup:

```js
export default {
  gasPayer: {
    walletAddress: '0x...',
    rpcUrl: 'https://mainnet.infura.io/v3/...',
    chainId: 1,
  },
  theme: 'light',
  reputationThreshold: {
    bypass: 70,
    easy: 50,
  },
};
```

## Development

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Run tests
pnpm test

# Build package
pnpm build
```

## License

MIT