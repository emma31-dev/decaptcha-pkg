/**
 * useWalletReputation hook - Custom Reputation system integration
 * 
 * Manages wallet reputation fetching, caching, and auto mode logic
 * for determining CAPTCHA difficulty based on custom onchain reputation scoring.
 * 
 * Trust Levels:
 * - High Trust (70+): Skip CAPTCHA entirely
 * - Medium Trust (40-69): Simple CAPTCHA challenge  
 * - Low Trust (<40): Advanced CAPTCHA challenge
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { ReputationData } from '../types';
import { fetchWalletReputation } from '../lib/reputation';

export interface UseWalletReputationReturn {
  // Reputation data
  reputationData: ReputationData | null;
  isLoading: boolean;
  error: string | null;
  
  // Auto mode logic
  determineCaptchaMode: (score: number) => 'bypass' | 'simple' | 'advanced';
  getRecommendedMode: () => 'simple' | 'advanced' | null;
  
  // Actions
  fetchReputation: (walletAddress: string, force?: boolean) => Promise<void>;
  clearReputation: () => void;
  refreshReputation: () => Promise<void>;
  
  // Configuration
  thresholds: {
    bypass: number;
    easy: number;
  };
  updateThresholds: (thresholds: { bypass: number; easy: number }) => void;
}

export interface UseWalletReputationOptions {
  // Reputation thresholds (Updated for custom scoring)
  bypassThreshold?: number; // Default: 70 (High Trust)
  easyThreshold?: number;   // Default: 40 (Medium Trust)
  
  // Caching options
  cacheExpiry?: number;     // Default: 5 minutes
  autoRefresh?: boolean;    // Default: true
  
  // Auto-fetch on wallet change
  autoFetch?: boolean;      // Default: true
  walletAddress?: string;   // Wallet to auto-fetch for
}

export const useWalletReputation = (
  options: UseWalletReputationOptions = {}
): UseWalletReputationReturn => {
  const {
    bypassThreshold = 70,
    easyThreshold = 40, // Updated threshold for custom scoring
    cacheExpiry = 300000, // 5 minutes
    autoRefresh = true,
    autoFetch = true,
    walletAddress
  } = options;
  
  // State
  const [reputationData, setReputationData] = useState<ReputationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thresholds, setThresholds] = useState({
    bypass: bypassThreshold,
    easy: easyThreshold
  });
  
  // Refs
  const currentWalletRef = useRef<string | null>(null);
  const refreshTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Auto mode logic - Updated for custom scoring thresholds
  const determineCaptchaMode = useCallback((score: number): 'bypass' | 'simple' | 'advanced' => {
    if (score >= thresholds.bypass) return 'bypass'; // High Trust (70+)
    if (score >= thresholds.easy) return 'simple';   // Medium Trust (40-69)
    return 'advanced';                               // Low Trust (<40)
  }, [thresholds.bypass, thresholds.easy]);
  
  const getRecommendedMode = useCallback((): 'simple' | 'advanced' | null => {
    if (!reputationData) return null;
    
    const mode = determineCaptchaMode(reputationData.score);
    if (mode === 'bypass') return null; // No CAPTCHA needed
    return mode;
  }, [reputationData, determineCaptchaMode]);
  
  // Fetch reputation with caching and error handling
  const fetchReputation = useCallback(async (address: string, force = false) => {
    if (!address) {
      setError('No wallet address provided');
      return;
    }
    
    // Check cache if not forcing refresh
    if (!force && reputationData && 
        reputationData.walletAddress === address &&
        Date.now() < reputationData.cacheExpiry) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    currentWalletRef.current = address;
    
    try {
      const data = await fetchWalletReputation(address);
      
      // Only update if this is still the current wallet
      if (currentWalletRef.current === address) {
        setReputationData(data);
        
        // Set up auto-refresh if enabled
        if (autoRefresh && refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
        
        if (autoRefresh) {
          const timeUntilExpiry = data.cacheExpiry - Date.now();
          refreshTimerRef.current = setTimeout(() => {
            if (currentWalletRef.current === address) {
              fetchReputation(address, true);
            }
          }, Math.max(timeUntilExpiry, 60000)); // Minimum 1 minute
        }
      }
    } catch (err) {
      if (currentWalletRef.current === address) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reputation';
        setError(errorMessage);
        console.error('Reputation fetch error:', err);
      }
    } finally {
      if (currentWalletRef.current === address) {
        setIsLoading(false);
      }
    }
  }, [reputationData, autoRefresh]);
  
  // Clear reputation data
  const clearReputation = useCallback(() => {
    setReputationData(null);
    setError(null);
    setIsLoading(false);
    currentWalletRef.current = null;
    
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);
  
  // Refresh current reputation
  const refreshReputation = useCallback(async () => {
    if (reputationData?.walletAddress) {
      await fetchReputation(reputationData.walletAddress, true);
    }
  }, [reputationData?.walletAddress, fetchReputation]);
  
  // Update thresholds
  const updateThresholds = useCallback((newThresholds: { bypass: number; easy: number }) => {
    setThresholds(newThresholds);
  }, []);
  
  // Auto-fetch when wallet address changes
  useEffect(() => {
    if (autoFetch && walletAddress && walletAddress !== currentWalletRef.current) {
      fetchReputation(walletAddress);
    } else if (!walletAddress && currentWalletRef.current) {
      clearReputation();
    }
  }, [walletAddress, autoFetch, fetchReputation, clearReputation]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
    };
  }, []);
  
  return {
    // Reputation data
    reputationData,
    isLoading,
    error,
    
    // Auto mode logic
    determineCaptchaMode,
    getRecommendedMode,
    
    // Actions
    fetchReputation,
    clearReputation,
    refreshReputation,
    
    // Configuration
    thresholds,
    updateThresholds,
  };
};

/**
 * Hook for simple reputation score fetching without caching
 */
export const useSimpleReputation = (walletAddress?: string) => {
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchScore = useCallback(async (address: string) => {
    if (!address) return;
    
    setIsLoading(true);
    try {
      const data = await fetchWalletReputation(address);
      setScore(data.score);
    } catch (error) {
      console.error('Failed to fetch reputation score:', error);
      setScore(null);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (walletAddress) {
      fetchScore(walletAddress);
    }
  }, [walletAddress, fetchScore]);
  
  return { score, isLoading, fetchScore };
};

export default useWalletReputation;