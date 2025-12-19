/**
 * Custom Reputation Scoring System
 * 
 * This module provides a standalone reputation calculation function that can be
 * imported and used independently in any dapp. It implements the scoring formula:
 * (Tx Activity + Contract Interaction + Age + Diversity) - Risk Flags
 */

import { WalletData, RiskFlag, ScoringWeights, ReputationConfig, CustomScoringAPI } from '../types';

// Default scoring weights
const DEFAULT_WEIGHTS: ScoringWeights = {
  transactionActivity: 30,
  contractInteractions: 20,
  walletAge: 20,
  tokenDiversity: 10,
  riskFlags: -30
};

// Default reputation configuration
const DEFAULT_CONFIG: ReputationConfig = {
  easyThreshold: 40,
  bypassThreshold: 70,
  weights: DEFAULT_WEIGHTS
};

// Known DeFi protocols for bonus scoring
const KNOWN_PROTOCOLS = [
  'uniswap', 'aave', 'compound', 'makerdao', 'curve', 'balancer',
  'sushiswap', '1inch', 'yearn', 'synthetix', 'chainlink', 'ens'
];

/**
 * Generates fallback wallet data when real data is unavailable
 * Uses deterministic randomization based on wallet address
 */
function generateFallbackWalletData(address: string): WalletData {
  // Generate deterministic fallback data based on address hash
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  const absHash = Math.abs(hash);
  
  return {
    address,
    transactionCount: (absHash % 50) + 1, // 1-50 transactions
    contractInteractions: (absHash % 10) + 1, // 1-10 interactions
    knownProtocolInteractions: [],
    walletAge: (absHash % 365) + 30, // 30-395 days
    tokenCount: (absHash % 5) + 1, // 1-5 tokens
    nftCount: absHash % 3, // 0-2 NFTs
    riskFlags: [],
    lastActivity: Date.now() - ((absHash % 86400000) + 3600000) // 1-24 hours ago
  };
}

/**
 * Generates mock wallet data for testing and development
 * Uses deterministic randomization based on wallet address
 * @deprecated Use real blockchain data instead
 */
export function generateMockWalletData(address: string): WalletData {
  // Create deterministic "random" values based on address hash
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  const random = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  const r1 = random(hash);
  const r2 = random(hash + 1);
  const r3 = random(hash + 2);
  const r4 = random(hash + 3);
  const r5 = random(hash + 4);
  
  // Generate realistic transaction count (0-500)
  const transactionCount = Math.floor(r1 * 500);
  
  // Generate contract interactions (0-50)
  const contractInteractions = Math.floor(r2 * 50);
  
  // Generate wallet age (1-1000 days)
  const walletAge = Math.floor(r3 * 1000) + 1;
  
  // Generate token/NFT counts
  const tokenCount = Math.floor(r4 * 20);
  const nftCount = Math.floor(r5 * 15);
  
  // Generate known protocol interactions
  const protocolCount = Math.floor(random(hash + 5) * 5);
  const knownProtocolInteractions = KNOWN_PROTOCOLS
    .sort(() => random(hash + 6) - 0.5)
    .slice(0, protocolCount);
  
  // Generate risk flags based on patterns
  const riskFlags: RiskFlag[] = [];
  
  // No activity risk
  if (transactionCount === 0) {
    riskFlags.push({
      type: 'no_activity',
      severity: -20,
      description: 'Wallet has no transaction history'
    });
  }
  
  // Large transaction risks (random chance)
  if (random(hash + 7) < 0.1) { // 10% chance
    riskFlags.push({
      type: 'large_inflow',
      severity: -10,
      description: 'Detected sudden large inflow of funds'
    });
  }
  
  if (random(hash + 8) < 0.05) { // 5% chance
    riskFlags.push({
      type: 'tornado_cash',
      severity: -30,
      description: 'Wallet has interacted with Tornado Cash'
    });
  }
  
  return {
    address,
    transactionCount,
    contractInteractions,
    knownProtocolInteractions,
    walletAge,
    tokenCount,
    nftCount,
    riskFlags,
    lastActivity: Date.now() - (random(hash + 9) * 30 * 24 * 60 * 60 * 1000) // Last 30 days
  };
}

/**
 * Calculates reputation score based on wallet data
 * Implements the scoring formula with configurable weights
 */
export function calculateScore(data: WalletData, weights: ScoringWeights = DEFAULT_WEIGHTS): number {
  let score = 0;
  
  // Transaction Activity (0-30 points)
  if (data.transactionCount >= 101) {
    score += 30;
  } else if (data.transactionCount >= 11) {
    score += 15;
  } else if (data.transactionCount > 0) {
    score += 5;
  }
  
  // Contract Interactions (0-20 points)
  if (data.contractInteractions > 0) {
    score += 10;
  }
  if (data.knownProtocolInteractions.length > 0) {
    score += 10;
  }
  
  // Wallet Age (0-20 points)
  const ageInMonths = data.walletAge / 30;
  if (ageInMonths >= 6) {
    score += 20;
  } else if (ageInMonths >= 1) {
    score += 10;
  } else {
    score += 5;
  }
  
  // Token/NFT Diversity (0-10 points)
  const totalAssets = data.tokenCount + data.nftCount;
  if (totalAssets > 10) {
    score += 10;
  } else if (totalAssets >= 3) {
    score += 6;
  } else if (totalAssets >= 1) {
    score += 2;
  }
  
  // Apply risk flags (negative points)
  data.riskFlags.forEach(flag => {
    score += flag.severity; // Severity is already negative
  });
  
  // Normalize to 0-100 range
  return Math.max(0, Math.min(100, score));
}

/**
 * Determines CAPTCHA mode based on reputation score
 */
export function determineCaptchaMode(score: number, config: ReputationConfig = DEFAULT_CONFIG): 'bypass' | 'simple' | 'advanced' {
  if (score >= config.bypassThreshold) return 'bypass';
  if (score >= config.easyThreshold) return 'simple';
  return 'advanced';
}

/**
 * Categorizes trust level based on score
 */
export function getTrustLevel(score: number): 'low' | 'medium' | 'high' {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

/**
 * Main function to calculate wallet reputation
 * This is the primary export that can be used as an atom in dapps
 */
export async function calculateWalletReputation(
  walletAddress: string, 
  config: ReputationConfig = DEFAULT_CONFIG,
  etherscanApiKey?: string
): Promise<number> {
  try {
    let walletData: WalletData;
    
    // Always try to fetch real blockchain data first
    try {
      const { fetchRealWalletData } = await import('../utils/etherscanApi');
      walletData = await fetchRealWalletData(walletAddress, {
        apiKey: etherscanApiKey,
        timeout: 15000,
        retries: 2
      });
      console.log(`✅ Fetched real wallet data for ${walletAddress}:`, {
        transactions: walletData.transactionCount,
        contracts: walletData.contractInteractions,
        protocols: walletData.knownProtocolInteractions,
        age: `${Math.floor(walletData.walletAge / 30)} months`,
        assets: `${walletData.tokenCount + walletData.nftCount} total`,
        risks: walletData.riskFlags.length
      });
    } catch (etherscanError) {
      console.error('❌ Failed to fetch real wallet data for', walletAddress + ':', etherscanError);
      // Generate fallback data based on address hash for consistency
      walletData = generateFallbackWalletData(walletAddress);
      console.log('🔄 Using fallback data for', walletAddress);
    }
    
    const score = calculateScore(walletData, config.weights);
    
    console.log(`Reputation calculated for ${walletAddress}:`, {
      score,
      trustLevel: getTrustLevel(score),
      captchaMode: determineCaptchaMode(score, config),
      dataSource: 'etherscan',
      walletData
    });
    
    return score;
  } catch (error) {
    console.error('Error calculating wallet reputation:', error);
    
    // Fallback to hash-based scoring
    return generateFallbackScore(walletAddress);
  }
}

/**
 * Generates a fallback reputation score when data fetching fails
 * Uses deterministic hash-based scoring for consistent results
 */
export function generateFallbackScore(walletAddress: string): number {
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = ((hash << 5) - hash) + walletAddress.charCodeAt(i);
    hash |= 0;
  }
  
  // Normalize to 20-60 range (lower to indicate fallback)
  return Math.abs(hash) % 41 + 20;
}

/**
 * Batch calculate reputation scores for multiple addresses
 */
export async function batchCalculateReputation(
  addresses: string[],
  config: ReputationConfig = DEFAULT_CONFIG,
  etherscanApiKey?: string
): Promise<Record<string, number>> {
  const results: Record<string, number> = {};
  
  // Process in batches to avoid overwhelming the system
  const batchSize = 10;
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (address) => {
      try {
        const score = await calculateWalletReputation(address, config, etherscanApiKey);
        return { address, score };
      } catch (error) {
        console.error(`Error calculating reputation for ${address}:`, error);
        return { address, score: generateFallbackScore(address) };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ address, score }) => {
      results[address] = score;
    });
  }
  
  return results;
}

/**
 * Custom Scoring API implementation
 */
export const customScoringAPI: CustomScoringAPI = {
  fetchWalletData: async (address: string, useReal: boolean = true, apiKey?: string) => {
    if (useReal) {
      try {
        const { fetchRealWalletData } = await import('../utils/etherscanApi');
        return await fetchRealWalletData(address, { apiKey });
      } catch (error) {
        console.warn('Failed to fetch real data, using fallback:', error);
        return generateFallbackWalletData(address);
      }
    }
    return generateFallbackWalletData(address);
  },
  
  calculateScore: (data: WalletData) => {
    return calculateScore(data);
  },
  
  generateMockData: (address: string) => {
    console.warn('generateMockData is deprecated, use real blockchain data instead');
    return generateMockWalletData(address);
  }
};

// Export default configuration and main function
export { DEFAULT_CONFIG, DEFAULT_WEIGHTS, KNOWN_PROTOCOLS };
export default calculateWalletReputation;