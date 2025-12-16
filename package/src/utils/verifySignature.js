/**
 * Signature Verification Utilities
 * 
 * This module provides utilities for wallet message signing and verification
 * using ethers.js. It includes SIWE-style signature validation and secure
 * message generation for wallet signing.
 */

import { ethers } from 'ethers';

/**
 * Generates a secure message for wallet signing
 * Uses SIWE (Sign-In with Ethereum) style format for consistency
 * @param {string} walletAddress - The wallet address
 * @param {string} domain - The domain requesting the signature
 * @param {string} nonce - UUID nonce for security (auto-generated if not provided)
 * @param {Object} options - Additional options
 * @returns {string} Formatted message for signing
 */
export function generateSigningMessage(walletAddress, domain = 'decap.app', nonce = null, options = {}) {
  const {
    statement = 'Sign this message to verify your identity for DeCap verification.',
    version = '1',
    chainId = 1,
    uri = `https://${domain}`,
    issuedAt = new Date().toISOString(),
    expirationTime = null,
    notBefore = null,
    requestId = null,
    resources = []
  } = options;

  // Generate nonce if not provided
  const messageNonce = nonce || generateNonce();

  // Build SIWE-style message
  let message = `${domain} wants you to sign in with your Ethereum account:\n`;
  message += `${walletAddress}\n\n`;
  
  if (statement) {
    message += `${statement}\n\n`;
  }
  
  message += `URI: ${uri}\n`;
  message += `Version: ${version}\n`;
  message += `Chain ID: ${chainId}\n`;
  message += `Nonce: ${messageNonce}\n`;
  message += `Issued At: ${issuedAt}`;
  
  if (expirationTime) {
    message += `\nExpiration Time: ${expirationTime}`;
  }
  
  if (notBefore) {
    message += `\nNot Before: ${notBefore}`;
  }
  
  if (requestId) {
    message += `\nRequest ID: ${requestId}`;
  }
  
  if (resources && resources.length > 0) {
    message += `\nResources:`;
    resources.forEach(resource => {
      message += `\n- ${resource}`;
    });
  }

  return message;
}

/**
 * Generates a cryptographically secure UUID-based nonce
 * @returns {string} UUID nonce string
 */
export function generateNonce() {
  // Use crypto.randomUUID if available (modern browsers)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback implementation using crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    
    // Set version (4) and variant bits
    array[6] = (array[6] & 0x0f) | 0x40; // Version 4
    array[8] = (array[8] & 0x3f) | 0x80; // Variant 10
    
    // Convert to hex string with hyphens
    const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    return [
      hex.slice(0, 8),
      hex.slice(8, 12),
      hex.slice(12, 16),
      hex.slice(16, 20),
      hex.slice(20, 32)
    ].join('-');
  }
  
  // Final fallback for environments without crypto
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Signs a message using ethers.js wallet
 * @param {string} message - Message to sign
 * @param {Object} wallet - Ethers wallet instance or signer
 * @returns {Promise<string>} Signature string
 */
export async function signMessage(message, wallet) {
  try {
    if (!wallet || typeof wallet.signMessage !== 'function') {
      throw new Error('Invalid wallet: must have signMessage method');
    }
    
    const signature = await wallet.signMessage(message);
    
    if (!signature || typeof signature !== 'string') {
      throw new Error('Invalid signature returned from wallet');
    }
    
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error(`Failed to sign message: ${error.message}`);
  }
}

/**
 * Verifies a signature against a message and expected signer address
 * @param {string} message - Original message that was signed
 * @param {string} signature - Signature to verify
 * @param {string} expectedAddress - Expected signer address
 * @returns {boolean} True if signature is valid, false otherwise
 */
export function verifySignature(message, signature, expectedAddress) {
  try {
    if (!message || !signature || !expectedAddress) {
      console.error('Missing required parameters for signature verification');
      return false;
    }
    
    // Recover the address from the signature
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    // Compare addresses (case-insensitive)
    const isValid = recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    
    if (!isValid) {
      console.warn(`Signature verification failed: expected ${expectedAddress}, got ${recoveredAddress}`);
    }
    
    return isValid;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

/**
 * Verifies a signature and checks if it's not expired
 * @param {string} message - Original SIWE-style message
 * @param {string} signature - Signature to verify
 * @param {string} expectedAddress - Expected signer address
 * @param {Object} options - Verification options
 * @returns {Object} Verification result with details
 */
export function verifySignatureWithExpiry(message, signature, expectedAddress, options = {}) {
  const {
    maxAge = 300000, // 5 minutes default
    clockTolerance = 60000 // 1 minute tolerance
  } = options;
  
  const result = {
    isValid: false,
    isExpired: false,
    address: null,
    error: null,
    parsedMessage: null
  };
  
  try {
    // Parse the SIWE message
    const parsedMessage = parseSIWEMessage(message);
    result.parsedMessage = parsedMessage;
    
    // Verify the signature
    const isSignatureValid = verifySignature(message, signature, expectedAddress);
    
    if (!isSignatureValid) {
      result.error = 'Invalid signature';
      return result;
    }
    
    result.address = expectedAddress;
    
    // Check expiration
    const now = new Date();
    
    if (parsedMessage.expirationTime) {
      const expirationTime = new Date(parsedMessage.expirationTime);
      if (now > expirationTime) {
        result.isExpired = true;
        result.error = 'Signature has expired';
        return result;
      }
    }
    
    // Check not before
    if (parsedMessage.notBefore) {
      const notBefore = new Date(parsedMessage.notBefore);
      if (now < notBefore) {
        result.error = 'Signature not yet valid';
        return result;
      }
    }
    
    // Check issued at + max age
    if (parsedMessage.issuedAt) {
      const issuedAt = new Date(parsedMessage.issuedAt);
      const maxValidTime = new Date(issuedAt.getTime() + maxAge);
      
      if (now > maxValidTime) {
        result.isExpired = true;
        result.error = 'Signature too old';
        return result;
      }
    }
    
    result.isValid = true;
    return result;
    
  } catch (error) {
    result.error = `Verification error: ${error.message}`;
    return result;
  }
}

/**
 * Parses a SIWE-style message into its components
 * @param {string} message - SIWE message to parse
 * @returns {Object} Parsed message components
 */
export function parseSIWEMessage(message) {
  const lines = message.split('\n');
  const result = {
    domain: null,
    address: null,
    statement: null,
    uri: null,
    version: null,
    chainId: null,
    nonce: null,
    issuedAt: null,
    expirationTime: null,
    notBefore: null,
    requestId: null,
    resources: []
  };
  
  try {
    // Parse domain and address from first lines
    if (lines[0] && lines[0].includes('wants you to sign in')) {
      result.domain = lines[0].split(' wants you to sign in')[0];
    }
    
    if (lines[1]) {
      result.address = lines[1];
    }
    
    // Find statement (lines between address and URI)
    let statementLines = [];
    let uriIndex = -1;
    
    for (let i = 2; i < lines.length; i++) {
      if (lines[i].startsWith('URI: ')) {
        uriIndex = i;
        break;
      }
      if (lines[i].trim()) {
        statementLines.push(lines[i]);
      }
    }
    
    if (statementLines.length > 0) {
      result.statement = statementLines.join('\n');
    }
    
    // Parse structured fields
    for (let i = uriIndex; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('URI: ')) {
        result.uri = line.substring(5);
      } else if (line.startsWith('Version: ')) {
        result.version = line.substring(9);
      } else if (line.startsWith('Chain ID: ')) {
        result.chainId = parseInt(line.substring(10));
      } else if (line.startsWith('Nonce: ')) {
        result.nonce = line.substring(7);
      } else if (line.startsWith('Issued At: ')) {
        result.issuedAt = line.substring(11);
      } else if (line.startsWith('Expiration Time: ')) {
        result.expirationTime = line.substring(17);
      } else if (line.startsWith('Not Before: ')) {
        result.notBefore = line.substring(12);
      } else if (line.startsWith('Request ID: ')) {
        result.requestId = line.substring(12);
      } else if (line === 'Resources:') {
        // Parse resources
        for (let j = i + 1; j < lines.length; j++) {
          if (lines[j].startsWith('- ')) {
            result.resources.push(lines[j].substring(2));
          }
        }
        break;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error parsing SIWE message:', error);
    throw new Error(`Failed to parse SIWE message: ${error.message}`);
  }
}

/**
 * Creates a wallet signer from a private key (for testing purposes)
 * @param {string} privateKey - Private key (with or without 0x prefix)
 * @param {Object} provider - Ethers provider (optional)
 * @returns {Object} Ethers wallet instance
 */
export function createWalletFromPrivateKey(privateKey, provider = null) {
  try {
    // Ensure private key has 0x prefix
    const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    if (provider) {
      return new ethers.Wallet(formattedKey, provider);
    } else {
      return new ethers.Wallet(formattedKey);
    }
  } catch (error) {
    console.error('Error creating wallet from private key:', error);
    throw new Error(`Failed to create wallet: ${error.message}`);
  }
}

/**
 * Validates an Ethereum address format
 * @param {string} address - Address to validate
 * @returns {boolean} True if valid address format
 */
export function isValidAddress(address) {
  try {
    return ethers.utils.isAddress(address);
  } catch (error) {
    return false;
  }
}

/**
 * Normalizes an Ethereum address to checksum format
 * @param {string} address - Address to normalize
 * @returns {string} Checksummed address
 */
export function normalizeAddress(address) {
  try {
    return ethers.utils.getAddress(address);
  } catch (error) {
    throw new Error(`Invalid address format: ${address}`);
  }
}

/**
 * Complete workflow for signing and verifying a message
 * @param {Object} wallet - Ethers wallet instance
 * @param {string} domain - Domain for SIWE message
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Complete signature workflow result
 */
export async function signAndVerifyWorkflow(wallet, domain = 'decap.app', options = {}) {
  try {
    const walletAddress = await wallet.getAddress();
    
    // Generate message
    const message = generateSigningMessage(walletAddress, domain, null, options);
    
    // Sign message
    const signature = await signMessage(message, wallet);
    
    // Verify signature
    const isValid = verifySignature(message, signature, walletAddress);
    
    // Verify with expiry
    const verificationResult = verifySignatureWithExpiry(message, signature, walletAddress, options);
    
    return {
      walletAddress,
      message,
      signature,
      isValid,
      verificationResult,
      nonce: verificationResult.parsedMessage?.nonce
    };
  } catch (error) {
    console.error('Error in sign and verify workflow:', error);
    throw error;
  }
}

export default {
  generateSigningMessage,
  generateNonce,
  signMessage,
  verifySignature,
  verifySignatureWithExpiry,
  parseSIWEMessage,
  createWalletFromPrivateKey,
  isValidAddress,
  normalizeAddress,
  signAndVerifyWorkflow
};