/**
 * Tests for Custom Reputation Scoring System
 */

import { describe, it, expect } from 'vitest';
import { 
  calculateWalletReputation, 
  calculateScore, 
  generateMockWalletData, 
  determineCaptchaMode, 
  getTrustLevel,
  generateFallbackScore,
  DEFAULT_CONFIG 
} from './customScoring';

describe('Custom Reputation Scoring', () => {
  const testAddress = '0x1234567890123456789012345678901234567890';

  describe('generateMockWalletData', () => {
    it('should generate consistent mock data for same address', () => {
      const data1 = generateMockWalletData(testAddress);
      const data2 = generateMockWalletData(testAddress);
      
      expect(data1).toEqual(data2);
      expect(data1.address).toBe(testAddress);
      expect(data1.transactionCount).toBeGreaterThanOrEqual(0);
      expect(data1.walletAge).toBeGreaterThan(0);
    });

    it('should generate different data for different addresses', () => {
      const data1 = generateMockWalletData(testAddress);
      const data2 = generateMockWalletData('0x9876543210987654321098765432109876543210');
      
      expect(data1).not.toEqual(data2);
    });
  });

  describe('calculateScore', () => {
    it('should calculate score correctly for high activity wallet', () => {
      const walletData = {
        address: testAddress,
        transactionCount: 150,
        contractInteractions: 25,
        knownProtocolInteractions: ['uniswap', 'aave'],
        walletAge: 365, // 1 year
        tokenCount: 15,
        nftCount: 5,
        riskFlags: [],
        lastActivity: Date.now()
      };

      const score = calculateScore(walletData);
      
      // Should get high score: 30 (tx) + 20 (contracts) + 20 (age) + 10 (diversity) = 80
      expect(score).toBeGreaterThanOrEqual(70);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate score correctly for low activity wallet', () => {
      const walletData = {
        address: testAddress,
        transactionCount: 5,
        contractInteractions: 0,
        knownProtocolInteractions: [],
        walletAge: 15, // 15 days
        tokenCount: 1,
        nftCount: 0,
        riskFlags: [],
        lastActivity: Date.now()
      };

      const score = calculateScore(walletData);
      
      // Should get low score: 5 (tx) + 0 (contracts) + 5 (age) + 2 (diversity) = 12
      expect(score).toBeLessThan(40);
    });

    it('should apply risk flags correctly', () => {
      const walletData = {
        address: testAddress,
        transactionCount: 100,
        contractInteractions: 10,
        knownProtocolInteractions: ['uniswap'],
        walletAge: 200,
        tokenCount: 5,
        nftCount: 2,
        riskFlags: [
          {
            type: 'tornado_cash' as const,
            severity: -30,
            description: 'Tornado Cash interaction'
          }
        ],
        lastActivity: Date.now()
      };

      const score = calculateScore(walletData);
      
      // Should be reduced by risk flag
      expect(score).toBeLessThan(70); // Would be ~70+ without risk flag
    });
  });

  describe('determineCaptchaMode', () => {
    it('should return bypass for high trust scores', () => {
      expect(determineCaptchaMode(75)).toBe('bypass');
      expect(determineCaptchaMode(100)).toBe('bypass');
    });

    it('should return simple for medium trust scores', () => {
      expect(determineCaptchaMode(50)).toBe('simple');
      expect(determineCaptchaMode(69)).toBe('simple');
    });

    it('should return advanced for low trust scores', () => {
      expect(determineCaptchaMode(30)).toBe('advanced');
      expect(determineCaptchaMode(39)).toBe('advanced');
    });
  });

  describe('getTrustLevel', () => {
    it('should categorize trust levels correctly', () => {
      expect(getTrustLevel(80)).toBe('high');
      expect(getTrustLevel(50)).toBe('medium');
      expect(getTrustLevel(30)).toBe('low');
    });
  });

  describe('generateFallbackScore', () => {
    it('should generate consistent fallback scores', () => {
      const score1 = generateFallbackScore(testAddress);
      const score2 = generateFallbackScore(testAddress);
      
      expect(score1).toBe(score2);
      expect(score1).toBeGreaterThanOrEqual(20);
      expect(score1).toBeLessThanOrEqual(60);
    });
  });

  describe('calculateWalletReputation', () => {
    it('should calculate reputation for wallet address', async () => {
      const score = await calculateWalletReputation(testAddress);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(typeof score).toBe('number');
    });

    it('should use custom config when provided', async () => {
      const customConfig = {
        ...DEFAULT_CONFIG,
        bypassThreshold: 80,
        easyThreshold: 50
      };

      const score = await calculateWalletReputation(testAddress, customConfig);
      
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });
});