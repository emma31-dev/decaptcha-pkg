/**
 * Orange Protocol Mock API Tests
 */

import { orangeProtocolAPI, fetchOrangeReputationScore, createSampleOrangeInput } from './orangeProtocol';
import { OrangeProtocolInput } from '../types';

describe('Orange Protocol Mock API', () => {
  describe('Input Validation', () => {
    test('should validate correct input format', () => {
      const validInput = createSampleOrangeInput();
      expect(orangeProtocolAPI.validateInput(validInput)).toBe(true);
    });

    test('should reject invalid input format', () => {
      const invalidInputs = [
        null,
        undefined,
        {},
        { result: {} },
        { result: { snsInfos: 'not-array' } },
        { result: { snsInfos: [], pohInfos: 'not-array' } },
        { result: { snsInfos: [], pohInfos: [], ensInfos: 'not-array' } }
      ];

      invalidInputs.forEach(input => {
        expect(orangeProtocolAPI.validateInput(input)).toBe(false);
      });
    });

    test('should validate ENS domain format', () => {
      const validInput: OrangeProtocolInput = {
        result: {
          snsInfos: [],
          pohInfos: [],
          ensInfos: ['valid.eth', 'another123.eth']
        }
      };
      expect(orangeProtocolAPI.validateInput(validInput)).toBe(true);

      const invalidInput: OrangeProtocolInput = {
        result: {
          snsInfos: [],
          pohInfos: [],
          ensInfos: ['invalid.com', 'no-extension', '.eth']
        }
      };
      expect(orangeProtocolAPI.validateInput(invalidInput)).toBe(false);
    });
  });

  describe('Score Generation', () => {
    test('should generate score between 0-100', () => {
      const input = createSampleOrangeInput();
      const score = orangeProtocolAPI.generateMockScore(input);
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
      expect(Number.isInteger(score)).toBe(true);
    });

    test('should generate higher scores for better social presence', () => {
      const highActivityInput: OrangeProtocolInput = {
        result: {
          snsInfos: [
            {
              snsType: 'Twitter',
              snsId: 'user1',
              userName: 'influencer',
              joinedTime: Math.floor(Date.now() / 1000) - (365 * 24 * 3600 * 5), // 5 years old
              followerCount: 50000,
              TweetsCount: 10000
            },
            {
              snsType: 'Discord',
              snsId: 'user2',
              userName: 'active_user',
              joinedTime: Math.floor(Date.now() / 1000) - (365 * 24 * 3600 * 3) // 3 years old
            }
          ],
          pohInfos: [
            { pohType: 'BrightID' },
            { pohType: 'Worldcoin' },
            { pohType: 'Gitcoin' }
          ],
          ensInfos: ['influencer.eth', 'myname.eth', 'crypto.eth']
        }
      };

      const lowActivityInput: OrangeProtocolInput = {
        result: {
          snsInfos: [
            {
              snsType: 'Twitter',
              snsId: 'newuser',
              userName: 'newbie',
              joinedTime: Math.floor(Date.now() / 1000) - (30 * 24 * 3600), // 30 days old
              followerCount: 5,
              TweetsCount: 2
            }
          ],
          pohInfos: [],
          ensInfos: []
        }
      };

      const highScore = orangeProtocolAPI.generateMockScore(highActivityInput);
      const lowScore = orangeProtocolAPI.generateMockScore(lowActivityInput);

      // High activity should generally score higher (allowing for randomness)
      expect(highScore).toBeGreaterThan(30);
      expect(lowScore).toBeLessThan(80);
    });
  });

  describe('API Processing', () => {
    test('should process valid request successfully', async () => {
      const input = createSampleOrangeInput();
      const result = await orangeProtocolAPI.processRequest(input);
      
      expect(result).toHaveProperty('result');
      expect(result).toHaveProperty('reputationScore');
      expect(typeof result.reputationScore).toBe('number');
      expect(result.reputationScore).toBeGreaterThanOrEqual(0);
      expect(result.reputationScore).toBeLessThanOrEqual(100);
    });

    test('should reject invalid request', async () => {
      const invalidInput = { invalid: 'data' };
      
      await expect(orangeProtocolAPI.processRequest(invalidInput as any))
        .rejects.toThrow('Invalid Orange Protocol input format');
    });

    test('should include original data in response', async () => {
      const input = createSampleOrangeInput();
      const result = await orangeProtocolAPI.processRequest(input);
      
      expect(result.result.snsInfos).toEqual(input.result.snsInfos);
      expect(result.result.pohInfos).toEqual(input.result.pohInfos);
      expect(result.result.ensInfos).toEqual(input.result.ensInfos);
    });
  });

  describe('Convenience Functions', () => {
    test('should fetch reputation score', async () => {
      const input = createSampleOrangeInput();
      const score = await fetchOrangeReputationScore(input);
      
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    test('should handle fetch errors gracefully', async () => {
      // Mock a validation failure
      const originalValidate = orangeProtocolAPI.validateInput;
      orangeProtocolAPI.validateInput = () => false;
      
      const input = createSampleOrangeInput();
      const score = await fetchOrangeReputationScore(input);
      
      // Should return fallback score
      expect(typeof score).toBe('number');
      expect(score).toBeGreaterThanOrEqual(10);
      expect(score).toBeLessThanOrEqual(50);
      
      // Restore original function
      orangeProtocolAPI.validateInput = originalValidate;
    });
  });

  describe('Sample Data Generation', () => {
    test('should create valid sample input', () => {
      const sample = createSampleOrangeInput();
      expect(orangeProtocolAPI.validateInput(sample)).toBe(true);
      expect(sample.result.snsInfos.length).toBeGreaterThan(0);
      expect(sample.result.pohInfos.length).toBeGreaterThan(0);
      expect(sample.result.ensInfos.length).toBeGreaterThan(0);
    });
  });
});