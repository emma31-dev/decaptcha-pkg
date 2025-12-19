/**
 * Reputation Utilities for DeCap SDK
 * 
 * This module provides easy-to-use functions for developers to fetch
 * wallet reputation scores and integrate them with their state management
 * (atoms, Redux, Zustand, etc.)
 */

import { calculateWalletReputation, getTrustLevel, determineCaptchaMode, DEFAULT_CONFIG } from '../lib/customScoring';
import { ReputationConfig, WalletData } from '../types';

export interface ReputationResult {
  score: number;
  trustLevel: 'low' | 'medium' | 'high';
  captchaMode: 'advanced' | 'simple' | 'bypass';
  walletData: WalletData;
  dataSource: 'etherscan' | 'mock' | 'fallback';
  timestamp: number;
}

export interface ReputationFetchOptions {
  /** Etherscan API key for real blockchain data */
  apiKey?: string;
  /** Custom scoring configuration */
  config?: ReputationConfig;
  /** Cache duration in milliseconds (default: 5 minutes) */
  cacheDuration?: number;
}

// In-memory cache for reputation scores
const reputationCache = new Map<string, { result: ReputationResult; expiry: number }>();

/**
 * Fetch wallet reputation score - Main function for developers to use
 * 
 * @param walletAddress - The wallet address to analyze
 * @param options - Configuration options
 * @returns Promise<ReputationResult> - Complete reputation analysis
 * 
 * @example
 * ```typescript
 * // Basic usage (will use fallback data if no API key)
 * const reputation = await fetchWalletReputation('0x123...');
 * 
 * // Production usage with real Etherscan data
 * const reputation = await fetchWalletReputation('0x123...', {
 *   apiKey: process.env.ETHERSCAN_API_KEY
 * });
 * 
 * // Use with state management
 * const [reputationAtom, setReputationAtom] = useAtom(walletReputationAtom);
 * const reputation = await fetchWalletReputation(walletAddress, { apiKey });
 * setReputationAtom(reputation);
 * ```
 */
export async function fetchWalletReputation(
  walletAddress: string,
  options: ReputationFetchOptions = {}
): Promise<ReputationResult> {
  const {
    apiKey,
    config = DEFAULT_CONFIG,
    cacheDuration = 300000 // 5 minutes default
  } = options;

  // Check cache first
  const cacheKey = `${walletAddress}_${apiKey ? 'real' : 'fallback'}`;
  const cached = reputationCache.get(cacheKey);
  if (cached && Date.now() < cached.expiry) {
    return cached.result;
  }

  try {
    // Calculate reputation score
    const score = await calculateWalletReputation(
      walletAddress,
      config,
      apiKey
    );

    // Get additional analysis
    const trustLevel = getTrustLevel(score);
    const captchaMode = determineCaptchaMode(score);

    // Get wallet data for detailed analysis
    const walletData = await getWalletDataForAddress(walletAddress, apiKey);

    const result: ReputationResult = {
      score,
      trustLevel,
      captchaMode,
      walletData,
      dataSource: apiKey ? 'etherscan' : 'fallback',
      timestamp: Date.now()
    };

    // Cache the result
    reputationCache.set(cacheKey, {
      result,
      expiry: Date.now() + cacheDuration
    });

    return result;

  } catch (error) {
    console.error('Failed to fetch wallet reputation:', error);
    
    // Return fallback result
    const fallbackResult: ReputationResult = {
      score: 25, // Low score for failed requests
      trustLevel: 'low',
      captchaMode: 'advanced',
      walletData: generateFallbackWalletData(walletAddress),
      dataSource: 'fallback',
      timestamp: Date.now()
    };

    return fallbackResult;
  }
}

/**
 * Batch fetch reputation scores for multiple wallets
 * Useful for analyzing multiple addresses at once
 */
export async function batchFetchWalletReputation(
  walletAddresses: string[],
  options: ReputationFetchOptions = {}
): Promise<Record<string, ReputationResult>> {
  const results: Record<string, ReputationResult> = {};
  
  // Process in batches of 5 to avoid rate limiting
  const batchSize = 5;
  for (let i = 0; i < walletAddresses.length; i += batchSize) {
    const batch = walletAddresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (address) => {
      try {
        const result = await fetchWalletReputation(address, options);
        return { address, result };
      } catch (error) {
        console.error(`Failed to fetch reputation for ${address}:`, error);
        return {
          address,
          result: {
            score: 25,
            trustLevel: 'low' as const,
            captchaMode: 'advanced' as const,
            walletData: generateFallbackWalletData(address),
            dataSource: 'fallback' as const,
            timestamp: Date.now()
          }
        };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    batchResults.forEach(({ address, result }) => {
      results[address] = result;
    });
  }
  
  return results;
}

/**
 * Hook-friendly function for React applications
 * Returns a function that can be called to fetch reputation
 */
export function createReputationFetcher(options: ReputationFetchOptions = {}) {
  return (walletAddress: string) => fetchWalletReputation(walletAddress, options);
}

/**
 * Clear reputation cache
 * Useful when switching networks or updating API keys
 */
export function clearReputationCache(): void {
  reputationCache.clear();
}

/**
 * Get cached reputation if available
 * Returns null if not cached or expired
 */
export function getCachedReputation(walletAddress: string, hasApiKey = false): ReputationResult | null {
  const cacheKey = `${walletAddress}_${hasApiKey ? 'real' : 'fallback'}`;
  const cached = reputationCache.get(cacheKey);
  
  if (cached && Date.now() < cached.expiry) {
    return cached.result;
  }
  
  return null;
}

/**
 * Determine CAPTCHA mode from reputation score
 * Standalone utility function
 */
export function getCaptchaModeFromScore(score: number): 'advanced' | 'simple' | 'bypass' {
  return determineCaptchaMode(score);
}

/**
 * Get trust level from reputation score
 * Standalone utility function
 */
export function getTrustLevelFromScore(score: number): 'low' | 'medium' | 'high' {
  return getTrustLevel(score);
}

// Internal helper functions

async function getWalletDataForAddress(
  walletAddress: string,
  apiKey?: string
): Promise<WalletData> {
  try {
    // Always try to fetch real data first
    const { fetchRealWalletData } = await import('../utils/etherscanApi');
    return await fetchRealWalletData(walletAddress, { apiKey });
  } catch (error) {
    console.warn('Failed to fetch real wallet data, using fallback data:', error);
    return generateFallbackWalletData(walletAddress);
  }
}

function generateFallbackWalletData(walletAddress: string): WalletData {
  // Generate deterministic fallback data based on address hash
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = ((hash << 5) - hash) + walletAddress.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  const absHash = Math.abs(hash);
  
  return {
    address: walletAddress,
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

// Export commonly used functions for easy importing
export {
  calculateWalletReputation,
  getTrustLevel,
  determineCaptchaMode,
  DEFAULT_CONFIG
} from '../lib/customScoring';