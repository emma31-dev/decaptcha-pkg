// Reputation system utilities - placeholder for now
import { ReputationData } from '../types';

export const fetchWalletReputation = async (walletAddress: string): Promise<ReputationData> => {
  // TODO: Implement full reputation fetching in task 2.2 and 2.3
  return {
    walletAddress,
    score: 0,
    sources: [],
    lastUpdated: Date.now(),
    cacheExpiry: Date.now() + 300000, // 5 minutes
  };
};

export const normalizeScore = (rawScore: any): number => {
  // TODO: Implement score normalization logic
  return 0;
};