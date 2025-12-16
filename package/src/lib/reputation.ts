// Reputation system utilities with Orange Protocol integration and caching
import { ReputationData, ReputationSourceResult } from '../types';
import { fetchOrangeScore } from '../utils/fetchOrangeScore.js';

// In-memory cache for reputation scores
const reputationCache = new Map<string, ReputationData>();

export const fetchWalletReputation = async (walletAddress: string): Promise<ReputationData> => {
  // Check cache first
  const cached = reputationCache.get(walletAddress);
  if (cached && Date.now() < cached.cacheExpiry) {
    return cached;
  }

  const sources: ReputationSourceResult[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Fetch Orange Protocol score
  try {
    const orangeScore = await fetchOrangeScore(walletAddress);
    const normalizedScore = normalizeScore(orangeScore);
    const weight = 0.4;
    
    sources.push({
      source: 'orange',
      rawScore: orangeScore,
      normalizedScore,
      weight,
      success: true
    });
    
    totalScore += normalizedScore * weight;
    totalWeight += weight;
  } catch (error) {
    sources.push({
      source: 'orange',
      rawScore: null,
      normalizedScore: 0,
      weight: 0.4,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Calculate final weighted score
  const finalScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;

  const reputationData: ReputationData = {
    walletAddress,
    score: finalScore,
    sources,
    lastUpdated: Date.now(),
    cacheExpiry: Date.now() + 300000, // 5 minutes
  };

  // Cache the result
  reputationCache.set(walletAddress, reputationData);
  
  // Clean old cache entries (simple cleanup)
  if (reputationCache.size > 100) {
    const now = Date.now();
    for (const [key, value] of reputationCache.entries()) {
      if (now > value.cacheExpiry) {
        reputationCache.delete(key);
      }
    }
  }

  return reputationData;
};

export const normalizeScore = (rawScore: any): number => {
  // Fast normalization with type coercion
  const score = Number(rawScore) || 0;
  return score < 0 ? 0 : score > 100 ? 100 : Math.round(score);
};

// Clear cache utility
export const clearReputationCache = (): void => {
  reputationCache.clear();
};