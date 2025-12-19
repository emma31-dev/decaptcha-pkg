# Etherscan API Integration Guide

The DeCap SDK includes built-in Etherscan API integration to fetch real onchain wallet data for accurate reputation scoring. This guide explains how to configure and use the Etherscan integration.

## Quick Start

### 1. Get Your Etherscan API Key

1. Visit [Etherscan.io](https://etherscan.io/apis)
2. Create a free account if you don't have one
3. Navigate to "API Keys" in your account dashboard
4. Create a new API key (free tier allows 5 calls/second, 100,000 calls/day)

### 2. Configure Your API Key

#### Option A: Environment Variable (Recommended)

Create a `.env` file in your project root:

```bash
# .env
ETHERSCAN_API_KEY=your_actual_api_key_here
```

#### Option B: Pass API Key Directly

```typescript
import { calculateWalletReputation } from 'decap-sdk';

const score = await calculateWalletReputation(
  walletAddress,
  DEFAULT_CONFIG,
  false, // Use real data
  'your_actual_api_key_here'
);
```

#### Option C: Configure EtherscanAPI Instance

```typescript
import { EtherscanAPI, fetchRealWalletData } from 'decap-sdk';

const api = new EtherscanAPI({
  apiKey: 'your_actual_api_key_here',
  network: 'mainnet',
  timeout: 15000,
  retries: 3
});

const walletData = await fetchRealWalletData(walletAddress, {
  apiKey: 'your_actual_api_key_here'
});
```

## Usage Examples

### Basic Usage with Environment Variable

```typescript
import { calculateWalletReputation } from 'decap-sdk';

// Automatically uses ETHERSCAN_API_KEY from environment
const score = await calculateWalletReputation(
  '0x1234567890123456789012345678901234567890',
  undefined, // Use default config
  false      // Use real Etherscan data
);

console.log(`Reputation Score: ${score}/100`);
```

### Development vs Production

```typescript
import { calculateWalletReputation } from 'decap-sdk';

const isDevelopment = process.env.NODE_ENV === 'development';

const score = await calculateWalletReputation(
  walletAddress,
  DEFAULT_CONFIG,
  isDevelopment, // Use mock data in development, real data in production
  process.env.ETHERSCAN_API_KEY
);
```

### React Hook Integration

```typescript
import { useState, useEffect } from 'react';
import { calculateWalletReputation, getTrustLevel } from 'decap-sdk';

function useWalletReputation(walletAddress: string) {
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!walletAddress) return;

    setLoading(true);
    setError(null);

    calculateWalletReputation(
      walletAddress,
      undefined,
      process.env.NODE_ENV === 'development', // Mock in dev, real in prod
      process.env.REACT_APP_ETHERSCAN_API_KEY
    )
      .then(setScore)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [walletAddress]);

  return {
    score,
    trustLevel: score ? getTrustLevel(score) : null,
    loading,
    error
  };
}

// Usage in component
function WalletAnalysis({ address }: { address: string }) {
  const { score, trustLevel, loading, error } = useWalletReputation(address);

  if (loading) return <div>Analyzing wallet...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!score) return null;

  return (
    <div>
      <h3>Wallet Reputation</h3>
      <p>Score: {score}/100</p>
      <p>Trust Level: {trustLevel}</p>
    </div>
  );
}
```

### State Management (Zustand/Redux)

```typescript
// store.ts
import { create } from 'zustand';
import { calculateWalletReputation } from 'decap-sdk';

interface ReputationStore {
  scores: Record<string, number>;
  loading: Record<string, boolean>;
  fetchReputation: (address: string) => Promise<void>;
}

export const useReputationStore = create<ReputationStore>((set, get) => ({
  scores: {},
  loading: {},

  fetchReputation: async (address: string) => {
    const { scores, loading } = get();
    
    if (scores[address] || loading[address]) return;

    set(state => ({
      loading: { ...state.loading, [address]: true }
    }));

    try {
      const score = await calculateWalletReputation(
        address,
        undefined,
        false, // Use real data
        process.env.ETHERSCAN_API_KEY
      );

      set(state => ({
        scores: { ...state.scores, [address]: score },
        loading: { ...state.loading, [address]: false }
      }));
    } catch (error) {
      set(state => ({
        loading: { ...state.loading, [address]: false }
      }));
      throw error;
    }
  }
}));
```

## Configuration Options

### EtherscanConfig Interface

```typescript
interface EtherscanConfig {
  apiKey?: string;           // Your Etherscan API key
  network?: 'mainnet' | 'goerli' | 'sepolia'; // Ethereum network
  timeout?: number;          // Request timeout in milliseconds (default: 10000)
  retries?: number;          // Number of retry attempts (default: 3)
}
```

### Supported Networks

- **mainnet**: Ethereum Mainnet (default)
- **goerli**: Goerli Testnet (deprecated)
- **sepolia**: Sepolia Testnet

```typescript
import { EtherscanAPI } from 'decap-sdk';

// Mainnet (default)
const mainnetAPI = new EtherscanAPI({
  apiKey: process.env.ETHERSCAN_API_KEY
});

// Sepolia testnet
const sepoliaAPI = new EtherscanAPI({
  apiKey: process.env.ETHERSCAN_API_KEY,
  network: 'sepolia'
});
```

## Environment Variables

### For Node.js Applications

Create a `.env` file:

```bash
# Required
ETHERSCAN_API_KEY=your_actual_api_key_here

# Optional
NODE_ENV=development
ETHERSCAN_NETWORK=mainnet
ETHERSCAN_TIMEOUT=15000
ETHERSCAN_RETRIES=3
```

### For React Applications

Create a `.env` file with `REACT_APP_` prefix:

```bash
# Required
REACT_APP_ETHERSCAN_API_KEY=your_actual_api_key_here

# Optional
REACT_APP_ETHERSCAN_NETWORK=mainnet
```

### For Next.js Applications

Create a `.env.local` file:

```bash
# Required
ETHERSCAN_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_ETHERSCAN_API_KEY=your_actual_api_key_here

# Optional
ETHERSCAN_NETWORK=mainnet
```

## Data Fetched from Etherscan

The integration fetches the following data for reputation scoring:

### Transaction Data
- **Regular Transactions**: ETH transfers and contract calls
- **Internal Transactions**: Contract-to-contract interactions
- **Token Transfers**: ERC-20 token movements
- **NFT Transfers**: ERC-721 and ERC-1155 transfers

### Analyzed Metrics
- **Transaction Count**: Total number of transactions
- **Contract Interactions**: Smart contract usage
- **Wallet Age**: Time since first transaction
- **Asset Diversity**: Number of unique tokens and NFTs
- **Protocol Interactions**: Known DeFi protocol usage
- **Risk Flags**: Suspicious activity detection

### Known Protocol Detection

The system automatically detects interactions with major DeFi protocols:

- **Uniswap**: V2 and V3 routers
- **Aave**: Lending pools
- **Compound**: Comptroller and governance
- **MakerDAO**: MKR and DAI contracts
- **Curve**: Major pools
- **ENS**: Registry and registrar

### Risk Flag Detection

- **Tornado Cash**: Privacy mixer interactions (-30 points)
- **Large Transactions**: Sudden large movements (-10 points)
- **No Activity**: Empty wallet history (-20 points)

## Error Handling

The system includes comprehensive error handling:

```typescript
import { calculateWalletReputation } from 'decap-sdk';

try {
  const score = await calculateWalletReputation(address, undefined, false);
  console.log('Score:', score);
} catch (error) {
  if (error.message.includes('API key')) {
    console.error('Invalid or missing Etherscan API key');
  } else if (error.message.includes('rate limit')) {
    console.error('Etherscan API rate limit exceeded');
  } else {
    console.error('Failed to fetch wallet data:', error.message);
  }
  
  // System automatically falls back to mock data or hash-based scoring
}
```

## Rate Limits and Best Practices

### Etherscan API Limits
- **Free Tier**: 5 calls/second, 100,000 calls/day
- **Paid Tiers**: Higher limits available

### Best Practices

1. **Cache Results**: Implement caching to avoid repeated API calls
2. **Batch Processing**: Process multiple wallets with delays
3. **Error Handling**: Always handle API failures gracefully
4. **Development Mode**: Use mock data during development
5. **Environment Variables**: Never hardcode API keys

### Caching Example

```typescript
import { calculateWalletReputation } from 'decap-sdk';

class ReputationCache {
  private cache = new Map<string, { score: number; timestamp: number }>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  async getScore(address: string): Promise<number> {
    const cached = this.cache.get(address);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.score;
    }

    const score = await calculateWalletReputation(address, undefined, false);
    
    this.cache.set(address, {
      score,
      timestamp: Date.now()
    });

    return score;
  }
}

const reputationCache = new ReputationCache();
```

## Troubleshooting

### Common Issues

1. **"Invalid API key" Error**
   - Verify your API key is correct
   - Check environment variable name
   - Ensure API key is active on Etherscan

2. **Rate Limit Exceeded**
   - Implement delays between requests
   - Consider upgrading to paid tier
   - Use caching to reduce API calls

3. **Network Errors**
   - Check internet connection
   - Verify Etherscan service status
   - Increase timeout settings

4. **Empty Results**
   - Wallet might have no transactions
   - Check if address is valid
   - Verify network configuration

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
process.env.DEBUG = 'decap:etherscan';

// Or enable in code
import { calculateWalletReputation } from 'decap-sdk';

const score = await calculateWalletReputation(
  address,
  { ...DEFAULT_CONFIG, debug: true },
  false
);
```

## Migration from Mock Data

If you're currently using mock data and want to switch to real data:

```typescript
// Before (mock data)
const score = await calculateWalletReputation(address);

// After (real data)
const score = await calculateWalletReputation(
  address,
  DEFAULT_CONFIG,
  false, // Use real data
  process.env.ETHERSCAN_API_KEY
);
```

## Support

For issues related to:
- **Etherscan API**: Contact [Etherscan Support](https://etherscan.io/contactus)
- **DeCap SDK**: Create an issue on our GitHub repository
- **Integration Help**: Check our examples and documentation

## Security Notes

- Never commit API keys to version control
- Use environment variables for API key storage
- Rotate API keys periodically
- Monitor API usage to detect unauthorized access
- Use HTTPS endpoints only (automatically handled)

---

**Next Steps**: Once you have your Etherscan API key configured, you can start using real onchain data for more accurate wallet reputation scoring in your dapp!