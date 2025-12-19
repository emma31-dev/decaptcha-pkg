// Reputation system utilities with Custom Scoring integration and caching
import { ReputationData, ReputationSourceResult, ReputationConfig } from '../types';
import { calculateWalletReputation, generateFallbackScore, DEFAULT_CONFIG } from './customScoring';

// In-memory cache for reputation scores
const reputationCache = new Map<string, ReputationData>();

export const fetchWalletReputation = async (
  walletAddress: string, 
  config: ReputationConfig = DEFAULT_CONFIG
): Promise<ReputationData> => {
  // Check cache first
  const cached = reputationCache.get(walletAddress);
  if (cached && Date.now() < cached.cacheExpiry) {
    return cached;
  }

  const sources: ReputationSourceResult[] = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Fetch Custom Scoring reputation
  try {
    const customScore = await calculateWalletReputation(walletAddress, config); // Use real blockchain data
    const normalizedScore = normalizeScore(customScore);
    const weight = 1.0; // Primary source gets full weight
    
    sources.push({
      source: 'custom',
      rawScore: customScore,
      normalizedScore,
      weight,
      success: true
    });
    
    totalScore += normalizedScore * weight;
    totalWeight += weight;
  } catch (error) {
    console.error('Custom scoring failed, using fallback:', error);
    
    // Use fallback scoring
    const fallbackScore = generateFallbackScore(walletAddress);
    const normalizedScore = normalizeScore(fallbackScore);
    const weight = 0.5; // Reduced weight for fallback
    
    sources.push({
      source: 'fallback',
      rawScore: fallbackScore,
      normalizedScore,
      weight,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    totalScore += normalizedScore * weight;
    totalWeight += weight;
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

// Utility to get trust level from score
export const getTrustLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
};

// Utility to determine CAPTCHA mode from score
export const getCaptchaMode = (score: number, config: ReputationConfig = DEFAULT_CONFIG): 'bypass' | 'simple' | 'advanced' => {
  if (score >= config.bypassThreshold) return 'bypass';
  if (score >= config.easyThreshold) return 'simple';
  return 'advanced';
};