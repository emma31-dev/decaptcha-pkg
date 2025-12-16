/**
 * Orange Protocol Integration Utility
 * 
 * This module integrates with the Orange Protocol mock API to fetch
 * reputation scores for wallet addresses. It handles error cases and
 * provides fallback scoring mechanisms.
 */

import { orangeProtocolAPI, fetchOrangeReputationScore, createSampleOrangeInput } from './orangeProtocol';

/**
 * Fetches Orange Protocol reputation score for a wallet address
 * @param {string} walletAddress - The wallet address to get reputation for
 * @param {Object} socialData - Optional social network and PoH data
 * @returns {Promise<number>} Reputation score (0-100)
 */
export async function fetchOrangeScore(walletAddress, socialData = null) {
  try {
    // If no social data provided, create sample data for testing
    const orangeInput = socialData || createSampleOrangeInput();
    
    // Add wallet address context to the input (for logging/tracking)
    console.log(`Fetching Orange Protocol score for wallet: ${walletAddress}`);
    
    // Fetch reputation score using Orange Protocol API
    const score = await fetchOrangeReputationScore(orangeInput);
    
    console.log(`Orange Protocol score for ${walletAddress}: ${score}`);
    return score;
    
  } catch (error) {
    console.error('Error fetching Orange Protocol score:', error);
    
    // Fallback scoring mechanism
    return generateFallbackScore(walletAddress);
  }
}

/**
 * Generates a fallback reputation score when Orange Protocol is unavailable
 * Fast hash-based scoring for consistent results
 */
function generateFallbackScore(walletAddress) {
  // Fast hash calculation
  let hash = 0;
  for (let i = 0; i < walletAddress.length; i++) {
    hash = ((hash << 5) - hash) + walletAddress.charCodeAt(i);
    hash |= 0; // Convert to 32-bit integer
  }
  
  // Normalize to 10-60 range (lower to indicate fallback)
  return Math.abs(hash) % 51 + 10;
}

/**
 * Validates Orange Protocol input data format
 * @param {Object} data - Input data to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateOrangeInput(data) {
  return orangeProtocolAPI.validateInput(data);
}

/**
 * Creates Orange Protocol input from user social data
 * @param {Object} userSocialData - User's social network information
 * @returns {Object} Orange Protocol formatted input
 */
export function createOrangeInput(userSocialData) {
  try {
    const {
      twitter = null,
      discord = null,
      google = null,
      telegram = null,
      pohVerifications = [],
      ensNames = []
    } = userSocialData;
    
    const snsInfos = [];
    
    // Add Twitter data if available
    if (twitter) {
      snsInfos.push({
        snsType: 'Twitter',
        snsId: twitter.id || 'unknown',
        userName: twitter.username || 'unknown',
        joinedTime: twitter.joinedTime || Math.floor(Date.now() / 1000) - (365 * 24 * 3600),
        followerCount: twitter.followers || 0,
        TweetsCount: twitter.tweets || 0
      });
    }
    
    // Add Discord data if available
    if (discord) {
      snsInfos.push({
        snsType: 'Discord',
        snsId: discord.id || 'unknown',
        userName: discord.username || 'unknown',
        joinedTime: discord.joinedTime || Math.floor(Date.now() / 1000) - (365 * 24 * 3600)
      });
    }
    
    // Add Google data if available
    if (google) {
      snsInfos.push({
        snsType: 'Google',
        snsId: google.id || 'unknown',
        userName: google.email || 'unknown',
        joinedTime: google.joinedTime || Math.floor(Date.now() / 1000) - (365 * 24 * 3600)
      });
    }
    
    // Add Telegram data if available
    if (telegram) {
      snsInfos.push({
        snsType: 'Telegram',
        snsId: telegram.id || 'unknown',
        userName: telegram.username || 'unknown',
        joinedTime: telegram.joinedTime || Math.floor(Date.now() / 1000) - (365 * 24 * 3600)
      });
    }
    
    // Format PoH verifications
    const pohInfos = pohVerifications.map(poh => ({
      pohType: poh.type || poh
    }));
    
    // Validate ENS names format
    const ensPattern = /^[a-zA-Z0-9]+\.eth$/;
    const validEnsNames = ensNames.filter(name => 
      typeof name === 'string' && ensPattern.test(name)
    );
    
    return {
      result: {
        snsInfos,
        pohInfos,
        ensInfos: validEnsNames
      }
    };
    
  } catch (error) {
    console.error('Error creating Orange Protocol input:', error);
    // Return sample input as fallback
    return createSampleOrangeInput();
  }
}

/**
 * Batch fetch reputation scores for multiple wallet addresses
 * @param {string[]} walletAddresses - Array of wallet addresses
 * @param {Object} socialData - Optional social data (same for all addresses)
 * @returns {Promise<Object>} Object mapping wallet addresses to scores
 */
export async function batchFetchOrangeScores(walletAddresses, socialData = null) {
  const results = {};
  
  // Process addresses in parallel with rate limiting
  const batchSize = 5;
  for (let i = 0; i < walletAddresses.length; i += batchSize) {
    const batch = walletAddresses.slice(i, i + batchSize);
    
    const batchPromises = batch.map(async (address) => {
      try {
        const score = await fetchOrangeScore(address, socialData);
        return { address, score };
      } catch (error) {
        console.error(`Error fetching score for ${address}:`, error);
        return { address, score: generateFallbackScore(address) };
      }
    });
    
    const batchResults = await Promise.all(batchPromises);
    
    // Add results to final object
    batchResults.forEach(({ address, score }) => {
      results[address] = score;
    });
  }
  
  return results;
}

export default {
  fetchOrangeScore,
  validateOrangeInput,
  createOrangeInput,
  batchFetchOrangeScores
};