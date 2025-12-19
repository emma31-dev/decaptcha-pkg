/**
 * Reputation Integration Demo
 * 
 * This demo shows how developers can integrate the reputation scoring
 * system with their state management (atoms, Redux, Zustand, etc.)
 */

import { 
  fetchWalletReputation as fetchReputationScore, 
  createReputationFetcher,
  getCachedReputation,
  clearReputationCache as clearCache
} from '../src/utils/reputationUtils';

// Example: Integration with Jotai atoms
interface WalletState {
  address: string | null;
  reputation: {
    score: number;
    trustLevel: 'low' | 'medium' | 'high';
    captchaMode: 'advanced' | 'simple' | 'bypass';
    lastUpdated: number;
  } | null;
}

// Simulated atom state
let walletAtom: WalletState = {
  address: null,
  reputation: null
};

// Simulated setter function
function setWalletAtom(newState: Partial<WalletState>) {
  walletAtom = { ...walletAtom, ...newState };
  console.log('🔄 Wallet atom updated:', walletAtom);
}

/**
 * Example 1: Basic reputation fetching on wallet connection
 */
async function onWalletConnect(walletAddress: string) {
  console.log('🔗 Wallet connected:', walletAddress);
  
  // Update wallet address in atom
  setWalletAtom({ address: walletAddress });
  
  try {
    // Fetch reputation score (uses real data with API key)
    const reputation = await fetchReputationScore(walletAddress, {
      apiKey: process.env.API_KEY_TOKEN
    });
    
    console.log('📊 Reputation fetched:', {
      score: reputation.score,
      trustLevel: reputation.trustLevel,
      captchaMode: reputation.captchaMode,
      dataSource: reputation.dataSource
    });
    
    // Update atom with reputation data
    setWalletAtom({
      reputation: {
        score: reputation.score,
        trustLevel: reputation.trustLevel,
        captchaMode: reputation.captchaMode,
        lastUpdated: reputation.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch reputation:', error);
    
    // Set fallback reputation
    setWalletAtom({
      reputation: {
        score: 25,
        trustLevel: 'low',
        captchaMode: 'advanced',
        lastUpdated: Date.now()
      }
    });
  }
}

/**
 * Example 2: Using with real Etherscan data
 */
async function onWalletConnectWithRealData(walletAddress: string, apiKey: string) {
  console.log('🔗 Wallet connected (real data):', walletAddress);
  
  try {
    // Fetch reputation with real blockchain data
    const reputation = await fetchReputationScore(walletAddress, {
      apiKey,
      cacheDuration: 600000 // 10 minutes cache
    });
    
    console.log('📊 Real reputation data:', {
      score: reputation.score,
      trustLevel: reputation.trustLevel,
      captchaMode: reputation.captchaMode,
      transactions: reputation.walletData.transactionCount,
      protocols: reputation.walletData.knownProtocolInteractions,
      age: `${Math.floor(reputation.walletData.walletAge / 30)} months`,
      dataSource: reputation.dataSource
    });
    
    // Update atom
    setWalletAtom({
      address: walletAddress,
      reputation: {
        score: reputation.score,
        trustLevel: reputation.trustLevel,
        captchaMode: reputation.captchaMode,
        lastUpdated: reputation.timestamp
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to fetch real reputation data:', error);
    // Fallback to basic fetching
    await onWalletConnect(walletAddress);
  }
}

/**
 * Example 3: Creating a reusable fetcher function
 */
function createWalletReputationFetcher(apiKey?: string) {
  return createReputationFetcher({
    apiKey,
    cacheDuration: 300000 // 5 minutes
  });
}

/**
 * Example 4: React-style usage (pseudo-code)
 */
function simulateReactUsage() {
  console.log('\n📱 React Integration Example:');
  console.log(`
// In your React component or custom hook:

import { fetchReputationScore } from 'decap-sdk';
import { useAtom } from 'jotai';

const walletReputationAtom = atom(null);

function useWalletReputation() {
  const [reputation, setReputation] = useAtom(walletReputationAtom);
  
  const fetchReputation = async (walletAddress, apiKey) => {
    try {
      const result = await fetchReputationScore(walletAddress, {
        apiKey
      });
      
      setReputation(result);
      return result;
    } catch (error) {
      console.error('Failed to fetch reputation:', error);
      return null;
    }
  };
  
  return { reputation, fetchReputation };
}

// In your wallet connection handler:
const { fetchReputation } = useWalletReputation();

const handleWalletConnect = async (address) => {
  const reputation = await fetchReputation(address, process.env.ETHERSCAN_API_KEY);
  
  // Use reputation.captchaMode to determine DeCap behavior
  // 'bypass' = skip CAPTCHA, 'simple' = easy CAPTCHA, 'advanced' = full CAPTCHA
};

// In your DeCap component:
<DeCap
  mode="auto"
  reputationScore={reputation?.score}
  userWallet={wallet}
  onSuccess={handleSuccess}
  onFailure={handleFailure}
>
  <button>Transfer Funds</button>
</DeCap>
  `);
}

/**
 * Example 5: Cache management
 */
function demonstrateCacheUsage(walletAddress: string) {
  console.log('\n💾 Cache Management Example:');
  
  // Check if reputation is cached
  const cached = getCachedReputation(walletAddress);
  if (cached) {
    console.log('✅ Found cached reputation:', cached.score);
    return cached;
  }
  
  console.log('❌ No cached reputation found');
  
  // Clear cache when switching networks or updating API keys
  clearCache();
  console.log('🗑️ Cache cleared');
}

/**
 * Run the demo
 */
async function runReputationIntegrationDemo() {
  console.log('🚀 Reputation Integration Demo\n');
  
  const testWallet = '0x957c9ea2a3e698e50f42fe78e39184acc74ebb62';
  const apiKey = process.env.API_KEY_TOKEN;
  
  // Example 1: Basic usage with real data
  console.log('📝 Example 1: Basic reputation fetching');
  await onWalletConnect(testWallet);
  
  console.log('\n📝 Example 2: Real data fetching');
  if (apiKey) {
    await onWalletConnectWithRealData(testWallet, apiKey);
  } else {
    console.log('⚠️ No API key found, skipping real data example');
  }
  
  // Example 3: Reusable fetcher
  console.log('\n📝 Example 3: Reusable fetcher');
  const fetcher = createWalletReputationFetcher(apiKey);
  const reputation = await fetcher(testWallet);
  console.log('🎯 Fetcher result:', reputation.score, reputation.trustLevel);
  
  // Example 4: React usage
  simulateReactUsage();
  
  // Example 5: Cache management
  demonstrateCacheUsage(testWallet);
  
  console.log('\n✅ Demo completed!');
  console.log('\n💡 Key Integration Points:');
  console.log('1. Call fetchReputationScore() on wallet connection');
  console.log('2. Store result in your state management (atom/Redux/Zustand)');
  console.log('3. Pass reputation.score as reputationScore prop to DeCap');
  console.log('4. DeCap will automatically handle bypass/simple/advanced modes');
  console.log('5. Use caching to avoid repeated API calls');
}

// Run the demo
runReputationIntegrationDemo().catch(console.error);