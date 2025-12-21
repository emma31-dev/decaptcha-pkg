/**
 * DeCap Configuration for Test DApp
 * 
 * This configuration file demonstrates how to set up DeCap SDK
 * for your application.
 */

module.exports = {
  // Etherscan API Configuration
  etherscan: {
    // Get your free API key from https://etherscan.io/apis
    // You can also set this via ETHERSCAN_API_KEY environment variable
    apiKey: process.env.ETHERSCAN_API_KEY || 'YourEtherscanApiKeyHere',
    
    // Network to use for reputation scoring
    network: 'mainnet',
    
    // Request timeout in milliseconds
    timeout: 10000
  },

  // Reputation Scoring Configuration
  reputation: {
    // Thresholds for different verification modes
    thresholds: {
      // Score >= 70: Skip verification entirely (bypass mode)
      bypass: 70,
      
      // Score >= 40: Simple puzzle only
      simple: 40,
      
      // Score < 40: Puzzle + wallet signature (advanced mode)
      advanced: 0
    },
    
    // Cache settings for better performance
    cache: {
      // Cache reputation scores for 5 minutes
      ttl: 300000,
      
      // Maximum number of cached scores
      maxEntries: 1000
    }
  },

  // Security Settings
  security: {
    // How long users have to complete wallet signing (5 minutes)
    signTimeout: 300000,
    
    // Maximum verification attempts before lockout
    maxAttempts: 3,
    
    // How long nonces remain valid (5 minutes)
    nonceExpiry: 300000
  },

  // UI/UX Settings
  ui: {
    // Default theme - 'auto' detects system preference
    defaultTheme: 'auto',
    
    // Enable smooth animations
    animations: {
      enabled: true,
      duration: 300
    },
    
    // Modal behavior
    modal: {
      // Don't close modal when clicking outside
      closeOnOverlayClick: false,
      
      // Show the X close button
      showCloseButton: true,
      
      // Auto-close success screen after 2 seconds
      autoCloseDelay: 2000
    }
  },

  // Development Settings
  development: {
    // Enable debug logging in development
    debug: process.env.NODE_ENV === 'development',
    
    // Use mock data when API key is not available
    useMockData: !process.env.ETHERSCAN_API_KEY,
    
    // Skip signature verification for testing (NOT recommended for production)
    skipSignatureVerification: false
  }
};