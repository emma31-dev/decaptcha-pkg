/**
 * DeCap Configuration File
 * 
 * This file contains configuration settings for the DeCap SDK.
 * Copy this file to your project root and customize the settings.
 */

module.exports = {
  // Etherscan API Configuration
  etherscan: {
    // Get your free API key from https://etherscan.io/apis
    apiKey: process.env.ETHERSCAN_API_KEY || 'YourEtherscanApiKeyHere',
    
    // Network to use for reputation scoring
    // Options: 'mainnet', 'sepolia', 'goerli' (deprecated)
    network: 'mainnet',
    
    // Request timeout in milliseconds
    timeout: 10000,
    
    // Rate limiting (requests per second)
    rateLimit: 5
  },

  // Reputation Scoring Configuration
  reputation: {
    // Thresholds for different verification modes
    thresholds: {
      // Score >= 70: Skip verification entirely
      bypass: 70,
      
      // Score >= 40: Simple puzzle only
      simple: 40,
      
      // Score < 40: Puzzle + wallet signature
      advanced: 0
    },
    
    // Scoring weights (must add up to 100)
    weights: {
      transactionActivity: 30,    // Based on transaction count and frequency
      contractInteractions: 20,   // Smart contract usage
      walletAge: 20,             // How long the wallet has been active
      tokenDiversity: 10,        // Number of different tokens held
      riskFlags: -20             // Negative points for suspicious activity
    },
    
    // Cache settings
    cache: {
      // How long to cache reputation scores (in milliseconds)
      ttl: 300000, // 5 minutes
      
      // Maximum number of cached scores
      maxEntries: 1000
    }
  },

  // Security Settings
  security: {
    // Message signing timeout (in milliseconds)
    signTimeout: 300000, // 5 minutes
    
    // Maximum number of verification attempts
    maxAttempts: 3,
    
    // Nonce expiration time (in milliseconds)
    nonceExpiry: 300000, // 5 minutes
    
    // Enable/disable signature verification
    verifySignatures: true
  },

  // UI/UX Settings
  ui: {
    // Default theme ('light', 'dark', 'auto')
    defaultTheme: 'auto',
    
    // Animation settings
    animations: {
      enabled: true,
      duration: 300 // milliseconds
    },
    
    // Modal settings
    modal: {
      // Close modal on overlay click
      closeOnOverlayClick: false,
      
      // Show close button
      showCloseButton: true,
      
      // Auto-close after success (in milliseconds, 0 to disable)
      autoCloseDelay: 2000
    }
  },

  // Development Settings
  development: {
    // Enable debug logging
    debug: process.env.NODE_ENV === 'development',
    
    // Use mock data when API is unavailable
    useMockData: false,
    
    // Skip actual signature verification (for testing)
    skipSignatureVerification: false
  },

  // Custom Scoring (Advanced)
  customScoring: {
    // Enable custom scoring function
    enabled: false,
    
    // Custom scoring function (if enabled)
    // Should return a score between 0-100
    scoringFunction: null,
    
    // Additional data sources
    dataSources: []
  }
};