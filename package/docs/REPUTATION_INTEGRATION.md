# Reputation Integration Guide

This guide shows you how to integrate the DeCap reputation scoring system with your dapp's state management.

## Quick Start

### 1. Install DeCap SDK

```bash
pnpm add decap-sdk
```

### 2. Fetch Reputation on Wallet Connection

```typescript
import { fetchReputationScore } from 'decap-sdk';

// When user connects wallet
async function handleWalletConnect(walletAddress: string) {
  const reputation = await fetchReputationScore(walletAddress, {
    apiKey: process.env.ETHERSCAN_API_KEY, // Optional: for real blockchain data
    useMockData: false // Set to true for testing without API key
  });
  
  // Store in your state management
  setWalletReputation(reputation);
}
```

### 3. Pass Reputation Score to DeCap

```typescript
import { DeCap } from 'decap-sdk';

<DeCap
  mode="auto"
  reputationScore={reputation?.score} // Pass the score here
  userWallet={wallet}
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <button>Transfer Funds</button>
</DeCap>
```

## Integration with State Management

### Jotai (Atoms)

```typescript
import { atom, useAtom } from 'jotai';
import { fetchReputationScore } from 'decap-sdk';

// Create atom for wallet reputation
const walletReputationAtom = atom(null);

// Custom hook
function useWalletReputation() {
  const [reputation, setReputation] = useAtom(walletReputationAtom);
  
  const fetchReputation = async (address: string) => {
    const result = await fetchReputationScore(address, {
      apiKey: process.env.ETHERSCAN_API_KEY
    });
    setReputation(result);
    return result;
  };
  
  return { reputation, fetchReputation };
}

// Usage in component
function MyComponent() {
  const { reputation, fetchReputation } = useWalletReputation();
  const { address } = useWallet();
  
  useEffect(() => {
    if (address) {
      fetchReputation(address);
    }
  }, [address]);
  
  return (
    <DeCap
      mode="auto"
      reputationScore={reputation?.score}
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    >
      <button>Transfer</button>
    </DeCap>
  );
}
```

### Redux

```typescript
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchReputationScore } from 'decap-sdk';

// Async thunk
export const fetchWalletReputation = createAsyncThunk(
  'wallet/fetchReputation',
  async (address: string) => {
    return await fetchReputationScore(address, {
      apiKey: process.env.ETHERSCAN_API_KEY
    });
  }
);

// Slice
const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    address: null,
    reputation: null,
    loading: false
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletReputation.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWalletReputation.fulfilled, (state, action) => {
        state.reputation = action.payload;
        state.loading = false;
      });
  }
});

// Usage
const dispatch = useDispatch();
const reputation = useSelector(state => state.wallet.reputation);

useEffect(() => {
  if (address) {
    dispatch(fetchWalletReputation(address));
  }
}, [address]);
```

### Zustand

```typescript
import create from 'zustand';
import { fetchReputationScore } from 'decap-sdk';

interface WalletStore {
  address: string | null;
  reputation: any | null;
  fetchReputation: (address: string) => Promise<void>;
}

const useWalletStore = create<WalletStore>((set) => ({
  address: null,
  reputation: null,
  fetchReputation: async (address) => {
    const reputation = await fetchReputationScore(address, {
      apiKey: process.env.ETHERSCAN_API_KEY
    });
    set({ reputation });
  }
}));

// Usage
function MyComponent() {
  const { reputation, fetchReputation } = useWalletStore();
  const { address } = useWallet();
  
  useEffect(() => {
    if (address) {
      fetchReputation(address);
    }
  }, [address]);
  
  return (
    <DeCap
      mode="auto"
      reputationScore={reputation?.score}
      userWallet={wallet}
      onSuccess={handleSuccess}
      onFailure={handleFailure}
    >
      <button>Transfer</button>
    </DeCap>
  );
}
```

## API Reference

### `fetchReputationScore(address, options)`

Fetches wallet reputation score and analysis.

**Parameters:**
- `address` (string): Wallet address to analyze
- `options` (object):
  - `apiKey` (string, optional): Etherscan API key for real data

  - `cacheDuration` (number, optional): Cache duration in milliseconds (default: 5 minutes)

**Returns:** `Promise<ReputationResult>`

```typescript
interface ReputationResult {
  score: number; // 0-100
  trustLevel: 'low' | 'medium' | 'high';
  captchaMode: 'advanced' | 'simple' | 'bypass';
  walletData: WalletData;
  dataSource: 'etherscan' | 'fallback';
  timestamp: number;
}
```

### Trust Levels & CAPTCHA Modes

| Score Range | Trust Level | CAPTCHA Mode | Behavior |
|-------------|-------------|--------------|----------|
| 0-39 | Low | advanced | Full CAPTCHA + wallet signature |
| 40-69 | Medium | simple | Simple CAPTCHA only |
| 70-100 | High | bypass | Skip CAPTCHA entirely |

## Advanced Usage

### Batch Fetching

```typescript
import { batchFetchWalletReputation } from 'decap-sdk';

const addresses = ['0x123...', '0x456...', '0x789...'];
const results = await batchFetchWalletReputation(addresses, {
  apiKey: process.env.ETHERSCAN_API_KEY
});

// results is an object: { '0x123...': ReputationResult, ... }
```

### Cache Management

```typescript
import { getCachedReputation, clearCache } from 'decap-sdk';

// Check cache before fetching
const cached = getCachedReputation(address);
if (cached) {
  console.log('Using cached reputation:', cached.score);
} else {
  // Fetch new reputation
}

// Clear cache when switching networks
clearCache();
```

### Custom Fetcher

```typescript
import { createReputationFetcher } from 'decap-sdk';

// Create a configured fetcher
const fetchReputation = createReputationFetcher({
  apiKey: process.env.ETHERSCAN_API_KEY,
  cacheDuration: 600000 // 10 minutes
});

// Use it multiple times
const rep1 = await fetchReputation('0x123...');
const rep2 = await fetchReputation('0x456...');
```

## Environment Setup

### Get Etherscan API Key

1. Go to [https://etherscan.io/apis](https://etherscan.io/apis)
2. Sign up for a free account
3. Generate an API key
4. Add to your `.env` file:

```env
ETHERSCAN_API_KEY=your_api_key_here
```

### Using Fallback Data (Development)

When no API key is provided, the system automatically uses fallback data:

```typescript
const reputation = await fetchReputationScore(address);
// Will use fallback data if no API key is provided
```

Fallback data generates consistent wallet profiles based on the address hash.

## Best Practices

1. **Fetch on Login**: Call `fetchReputationScore()` when the user connects their wallet
2. **Cache Results**: Use the built-in caching to avoid repeated API calls
3. **Handle Errors**: Always have fallback behavior for failed reputation fetches
4. **Update on Network Change**: Clear cache and refetch when user switches networks
5. **Use Auto Mode**: Set `mode="auto"` and pass `reputationScore` prop for automatic CAPTCHA adjustment

## Example: Complete Integration

```typescript
import { DeCap, fetchReputationScore } from 'decap-sdk';
import { atom, useAtom } from 'jotai';
import { useEffect } from 'react';

// Atom for reputation
const reputationAtom = atom(null);

function TransferButton() {
  const [reputation, setReputation] = useAtom(reputationAtom);
  const { address, signMessage } = useWallet();
  
  // Fetch reputation on wallet connection
  useEffect(() => {
    if (address) {
      fetchReputationScore(address, {
        apiKey: process.env.ETHERSCAN_API_KEY,
        useMockData: !process.env.ETHERSCAN_API_KEY
      }).then(setReputation);
    }
  }, [address]);
  
  const handleSuccess = (proof) => {
    console.log('Verification successful:', proof);
    // Proceed with transaction
  };
  
  return (
    <DeCap
      mode="auto"
      reputationScore={reputation?.score}
      userWallet={{ address, signMessage, isConnected: true }}
      onSuccess={handleSuccess}
      onFailure={() => console.log('Verification failed')}
    >
      <button>Transfer Funds</button>
    </DeCap>
  );
}
```

## Troubleshooting

### "NOTOK" Error from Etherscan

- Make sure you're using a valid API key
- Check that you're using the V2 API endpoints (handled automatically by the SDK)
- Verify your API key has not exceeded rate limits

### Reputation Always Returns Low Score

- Check if you're using mock data vs real data
- Verify the wallet address is valid
- Ensure the Etherscan API key is working

### Cache Not Working

- Cache is per-address and per-data-source (mock vs real)
- Cache expires after 5 minutes by default (configurable)
- Use `getCachedReputation()` to check cache status

## Support

For issues or questions:
- GitHub Issues: [your-repo/issues](https://github.com/your-repo/issues)
- Documentation: [your-docs-url](https://your-docs-url.com)
