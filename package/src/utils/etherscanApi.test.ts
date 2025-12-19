/**
 * Tests for Etherscan API Integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  EtherscanAPI,
  analyzeRiskFlags,
  detectProtocolInteractions,
  calculateWalletAge,
  countAssets,
  KNOWN_PROTOCOL_ADDRESSES
} from './etherscanApi';

// Mock fetch for testing
global.fetch = vi.fn();

describe('Etherscan API Integration', () => {
  const mockFetch = fetch as any;

  beforeEach(() => {
    mockFetch.mockClear();
  });

  describe('EtherscanAPI', () => {
    it('should create API instance with default config', () => {
      const api = new EtherscanAPI();
      expect(api).toBeInstanceOf(EtherscanAPI);
    });

    it('should create API instance with custom config', () => {
      const api = new EtherscanAPI({
        apiKey: 'test-key',
        network: 'goerli',
        timeout: 5000
      });
      expect(api).toBeInstanceOf(EtherscanAPI);
    });

    it('should handle successful API response', async () => {
      const mockResponse = {
        status: '1',
        message: 'OK',
        result: [
          {
            hash: '0x123',
            from: '0xabc',
            to: '0xdef',
            value: '1000000000000000000',
            timeStamp: '1640995200'
          }
        ]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const api = new EtherscanAPI({ apiKey: 'test' });
      const result = await api.getTransactions('0x123');
      
      expect(result).toEqual(mockResponse.result);
    });

    it.skip('should handle API error response', async () => {
      const mockResponse = {
        status: '0',
        message: 'Invalid API key',
        result: []
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const api = new EtherscanAPI({ apiKey: 'invalid' });
      
      await expect(api.getTransactions('0x123')).rejects.toThrow('Etherscan API error: Invalid API key');
    });
  });

  describe('analyzeRiskFlags', () => {
    it('should detect Tornado Cash interactions', () => {
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado Cash 0.1 ETH
          value: '100000000000000000',
          timeStamp: '1640995200',
          isError: '0',
          input: '0x'
        }
      ];

      const riskFlags = analyzeRiskFlags(transactions);
      
      expect(riskFlags).toHaveLength(1);
      expect(riskFlags[0].type).toBe('tornado_cash');
      expect(riskFlags[0].severity).toBe(-30);
    });

    it('should detect large transactions', () => {
      const recentTimestamp = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
      
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0xdef',
          value: '50000000000000000000', // 50 ETH
          timeStamp: recentTimestamp.toString(),
          isError: '0',
          input: '0x'
        }
      ];

      const riskFlags = analyzeRiskFlags(transactions);
      
      expect(riskFlags).toHaveLength(1);
      expect(riskFlags[0].type).toBe('large_outflow');
      expect(riskFlags[0].severity).toBe(-10);
    });

    it('should return empty array for clean transactions', () => {
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0xdef',
          value: '1000000000000000000', // 1 ETH
          timeStamp: '1640995200',
          isError: '0',
          input: '0x'
        }
      ];

      const riskFlags = analyzeRiskFlags(transactions);
      expect(riskFlags).toHaveLength(0);
    });
  });

  describe('detectProtocolInteractions', () => {
    it('should detect Uniswap interactions', () => {
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap V2 Router
          value: '0',
          timeStamp: '1640995200',
          isError: '0',
          input: '0x'
        }
      ];

      const protocols = detectProtocolInteractions(transactions);
      
      expect(protocols).toContain('uniswap');
    });

    it('should detect multiple protocol interactions', () => {
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d', // Uniswap
          value: '0',
          timeStamp: '1640995200',
          isError: '0',
          input: '0x'
        },
        {
          hash: '0x456',
          from: '0xabc',
          to: '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9', // Aave
          value: '0',
          timeStamp: '1640995300',
          isError: '0',
          input: '0x'
        }
      ];

      const protocols = detectProtocolInteractions(transactions);
      
      expect(protocols).toContain('uniswap');
      expect(protocols).toContain('aave');
    });

    it('should exclude Tornado Cash from protocol bonuses', () => {
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc', // Tornado Cash
          value: '0',
          timeStamp: '1640995200',
          isError: '0',
          input: '0x'
        }
      ];

      const protocols = detectProtocolInteractions(transactions);
      expect(protocols).not.toContain('tornado');
    });
  });

  describe('calculateWalletAge', () => {
    it('should calculate wallet age correctly', () => {
      const oldTimestamp = Math.floor(Date.now() / 1000) - (365 * 24 * 60 * 60); // 1 year ago
      
      const transactions = [
        {
          hash: '0x123',
          from: '0xabc',
          to: '0xdef',
          value: '1000000000000000000',
          timeStamp: oldTimestamp.toString(),
          isError: '0',
          input: '0x'
        }
      ];

      const age = calculateWalletAge(transactions);
      
      expect(age).toBeGreaterThan(360); // Should be around 365 days
      expect(age).toBeLessThan(370);
    });

    it('should return 0 for empty transaction list', () => {
      const age = calculateWalletAge([]);
      expect(age).toBe(0);
    });
  });

  describe('countAssets', () => {
    it('should count unique tokens and NFTs', () => {
      const tokenTransfers = [
        { contractAddress: '0x123', hash: '0xa', from: '0x1', to: '0x2', value: '100', timeStamp: '1640995200', isError: '0', input: '0x' },
        { contractAddress: '0x123', hash: '0xb', from: '0x1', to: '0x2', value: '200', timeStamp: '1640995300', isError: '0', input: '0x' }, // Duplicate
        { contractAddress: '0x456', hash: '0xc', from: '0x1', to: '0x2', value: '300', timeStamp: '1640995400', isError: '0', input: '0x' }
      ];

      const nftTransfers = [
        { contractAddress: '0x789', hash: '0xd', from: '0x1', to: '0x2', value: '1', timeStamp: '1640995500', isError: '0', input: '0x' },
        { contractAddress: '0xabc', hash: '0xe', from: '0x1', to: '0x2', value: '2', timeStamp: '1640995600', isError: '0', input: '0x' }
      ];

      const { tokenCount, nftCount } = countAssets(tokenTransfers, nftTransfers);
      
      expect(tokenCount).toBe(2); // 0x123 and 0x456
      expect(nftCount).toBe(2); // 0x789 and 0xabc
    });

    it('should handle empty arrays', () => {
      const { tokenCount, nftCount } = countAssets([], []);
      
      expect(tokenCount).toBe(0);
      expect(nftCount).toBe(0);
    });
  });

  describe('KNOWN_PROTOCOL_ADDRESSES', () => {
    it('should contain major DeFi protocols', () => {
      expect(KNOWN_PROTOCOL_ADDRESSES).toHaveProperty('0x7a250d5630b4cf539739df2c5dacb4c659f2488d'); // Uniswap
      expect(KNOWN_PROTOCOL_ADDRESSES).toHaveProperty('0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9'); // Aave
      expect(KNOWN_PROTOCOL_ADDRESSES).toHaveProperty('0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b'); // Compound
    });

    it('should contain Tornado Cash addresses for risk detection', () => {
      expect(KNOWN_PROTOCOL_ADDRESSES).toHaveProperty('0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc'); // Tornado 0.1 ETH
      expect(KNOWN_PROTOCOL_ADDRESSES).toHaveProperty('0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936'); // Tornado 1 ETH
    });
  });
});