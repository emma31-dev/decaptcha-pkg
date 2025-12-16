/**
 * Orange Protocol Mock API Implementation
 * 
 * This module provides a mock implementation of the Orange Protocol API
 * for testing reputation-based verification flows. It can be easily
 * replaced with the real Orange Protocol API when available.
 */

import { OrangeProtocolInput, OrangeProtocolOutput, OrangeProtocolAPI } from '../types';

// JSON Schema for Orange Protocol input validation
const ORANGE_PROTOCOL_SCHEMA = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "result": {
      "type": "object",
      "properties": {
        "snsInfos": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "snsType": {
                "type": "string",
                "enum": ["Discord", "Google", "Telegram", "Twitter"]
              },
              "snsId": {
                "type": "string"
              },
              "userName": {
                "type": "string"
              },
              "joinedTime": {
                "type": "integer",
                "description": "Unix timestamp of when the user joined the platform"
              },
              "followerCount": {
                "type": "integer"
              },
              "TweetsCount": {
                "type": "integer"
              }
            },
            "required": ["snsType", "snsId", "userName"],
            "additionalProperties": false
          }
        },
        "pohInfos": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "pohType": {
                "type": "string"
              }
            },
            "required": ["pohType"]
          }
        },
        "ensInfos": {
          "type": "array",
          "items": {
            "type": "string",
            "pattern": "^[a-zA-Z0-9]+\\.eth$"
          }
        }
      },
      "required": ["snsInfos", "pohInfos", "ensInfos"]
    }
  },
  "required": ["result"]
};

/**
 * Validates input data against Orange Protocol JSON schema
 * Optimized for fast validation with early returns
 */
function validateInput(data: any): boolean {
  // Fast path validation
  if (!data?.result) return false;
  
  const { snsInfos, pohInfos, ensInfos } = data.result;
  
  // Quick array checks
  if (!Array.isArray(snsInfos) || !Array.isArray(pohInfos) || !Array.isArray(ensInfos)) {
    return false;
  }
  
  // Validate snsInfos with early exit
  const validSnsTypes = new Set(['Discord', 'Google', 'Telegram', 'Twitter']);
  for (let i = 0; i < snsInfos.length; i++) {
    const sns = snsInfos[i];
    if (!sns.snsType || !sns.snsId || !sns.userName || !validSnsTypes.has(sns.snsType)) {
      return false;
    }
  }
  
  // Validate pohInfos (minimal check)
  for (let i = 0; i < pohInfos.length; i++) {
    if (!pohInfos[i].pohType) return false;
  }
  
  // Validate ENS with compiled regex
  const ensPattern = /^[a-zA-Z0-9]+\.eth$/;
  for (let i = 0; i < ensInfos.length; i++) {
    if (!ensPattern.test(ensInfos[i])) return false;
  }
  
  return true;
}

/**
 * Generates a mock reputation score based on input data
 * Optimized for fast calculation with weighted scoring
 */
function generateMockScore(input: OrangeProtocolInput): number {
  const { snsInfos, pohInfos, ensInfos } = input.result;
  
  // Fast calculation using bitwise operations and lookup tables
  let score = 0;
  const currentTime = Date.now() / 1000;
  
  // Social accounts (20% weight) - fast calculation
  score += Math.min(snsInfos.length << 3, 60) * 0.2; // Bit shift for *8, then *7.5 ≈ *15
  
  // Followers and age (55% combined weight) - single loop optimization
  let totalFollowers = 0;
  let ageScore = 0;
  
  for (let i = 0; i < snsInfos.length; i++) {
    const sns = snsInfos[i];
    totalFollowers += (sns.followerCount || 0) + ((sns.TweetsCount || 0) * 0.1);
    
    if (sns.joinedTime) {
      const years = (currentTime - sns.joinedTime) / 31536000; // 365*24*3600
      ageScore += Math.min(years * 10, 25);
    }
  }
  
  // Logarithmic follower score (30% weight)
  score += Math.min(Math.log10(totalFollowers + 1) * 10, 100) * 0.3;
  
  // Age score (25% weight)
  score += Math.min(ageScore, 100) * 0.25;
  
  // PoH and ENS (25% combined weight) - fast calculation
  score += Math.min(pohInfos.length * 25, 100) * 0.15;
  score += Math.min(ensInfos.length * 20, 100) * 0.1;
  
  // Fast random variation (±10)
  score += (Math.random() - 0.5) * 20;
  
  // Clamp to 0-100 range
  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Processes Orange Protocol request and returns mock response
 */
async function processRequest(input: OrangeProtocolInput): Promise<OrangeProtocolOutput> {
  // Validate input
  if (!validateInput(input)) {
    throw new Error('Invalid Orange Protocol input format');
  }
  
  // Generate mock score
  const reputationScore = generateMockScore(input);
  
  // Return same structure as input with added reputation score
  const output: OrangeProtocolOutput = {
    ...input,
    reputationScore
  };
  
  return output;
}

/**
 * Orange Protocol Mock API implementation
 * This object can be easily replaced with real API calls
 */
export const orangeProtocolAPI: OrangeProtocolAPI = {
  validateInput,
  generateMockScore,
  processRequest
};

/**
 * Convenience function to fetch reputation score from Orange Protocol
 * @param input Orange Protocol formatted input data
 * @returns Promise resolving to reputation score (0-100)
 */
export async function fetchOrangeReputationScore(input: OrangeProtocolInput): Promise<number> {
  try {
    const result = await orangeProtocolAPI.processRequest(input);
    return result.reputationScore || 0;
  } catch (error) {
    console.error('Failed to fetch Orange Protocol reputation score:', error);
    // Return random fallback score
    return Math.floor(Math.random() * 40) + 10; // 10-50 range for failed requests
  }
}

/**
 * Creates sample Orange Protocol input for testing
 */
export function createSampleOrangeInput(): OrangeProtocolInput {
  return {
    result: {
      snsInfos: [
        {
          snsType: 'Twitter',
          snsId: 'user123',
          userName: 'cryptouser',
          joinedTime: Math.floor(Date.now() / 1000) - (365 * 24 * 3600 * 2), // 2 years ago
          followerCount: 1250,
          TweetsCount: 450
        },
        {
          snsType: 'Discord',
          snsId: 'discord456',
          userName: 'cryptouser#1234',
          joinedTime: Math.floor(Date.now() / 1000) - (365 * 24 * 3600 * 1.5) // 1.5 years ago
        }
      ],
      pohInfos: [
        { pohType: 'BrightID' },
        { pohType: 'Worldcoin' }
      ],
      ensInfos: [
        'cryptouser.eth',
        'myname.eth'
      ]
    }
  };
}

export default orangeProtocolAPI;