/**
 * DeCap Configuration for Demo Examples
 * 
 * This configuration file demonstrates various DeCap SDK settings
 * and is used by the demo examples in this folder.
 */

module.exports = {
  // Etherscan API Configuration
  etherscan: {
    // Get your free API key from https://etherscan.io/apis
    apiKey: process.env.ETHERSCAN_API_KEY || 'demo-api-key-placeholder',
    
    // Network to use for reputation scoring
    network: 'mainnet',
    
    // Request timeout in milliseconds
    timeout: 15000,
    
    // Rate limiting (requests per second)
    rateLimit: 3
  },

  // Reputation Scoring Configuration
  reputation: {
    // Thresholds for different verification modes
    thresholds: {
      // Score >= 75: Skip verification entirely (higher threshold for demo)
      bypass: 75,
      
      // Score >= 45: Simple puzzle only (slightly higher for demo)
      simple: 45,
      
      // Score < 45: Puzzle + wallet signature
      advanced: 0
    },
    
    // Scoring weights (must add up to 100)
    weights: {
      transactionActivity: 35,    // Emphasize transaction history
      contractInteractions: 25,   // Smart contract usage
      walletAge: 20,             // How long the wallet has been active
      tokenDiversity: 15,        // Number of different tokens held
      riskFlags: -25             // Negative points for suspicious activity
    },
    
    // Cache settings
    cache: {
      // Cache reputation scores for 10 minutes in demo
      ttl: 600000,
      
      // Maximum number of cached scores
      maxEntries: 500
    }
  },

  // Security Settings
  security: {
    // Message signing timeout (10 minutes for demo)
    signTimeout: 600000,
    
    // Maximum number of verification attempts
    maxAttempts: 5,
    
    // Nonce expiration time (10 minutes for demo)
    nonceExpiry: 600000,
    
    // Enable signature verification
    verifySignatures: true
  },

  // UI/UX Settings
  ui: {
    // Default theme
    defaultTheme: 'auto',
    
    // Animation settings
    animations: {
      enabled: true,
      duration: 400 // Slightly slower for demo visibility
    },
    
    // Modal settings
    modal: {
      // Don't close modal on overlay click for demo
      closeOnOverlayClick: false,
      
      // Show close button
      showCloseButton: true,
      
      // Auto-close after success (3 seconds for demo)
      autoCloseDelay: 3000
    }
  },

  // Development Settings
  development: {
    // Enable debug logging for demos
    debug: true,
    
    // Use mock data when API key is not available
    useMockData: !process.env.ETHERSCAN_API_KEY,
    
    // Skip signature verification for testing (enabled for demo)
    skipSignatureVerification: false
  },

  // Custom Scoring (Advanced Demo)
  customScoring: {
    // Enable custom scoring for advanced demos
    enabled: true,
    
    // Custom scoring function example
    scoringFunction: async (walletAddress) => {
      // Demo custom scoring logic
      console.log('Demo: Custom scoring for', walletAddress);
      
      // Simple demo logic based on address characteristics
      const addressLower = walletAddress.toLowerCase();
      let score = 50; // Base score
      
      // Bonus for addresses with certain patterns (demo logic)
      if (addressLower.includes('dead') || addressLower.includes('beef')) {
        score += 20; // Well-known test addresses
      }
      
      if (addressLower.startsWith('0x000')) {
        score -= 30; // Suspicious zero-heavy addresses
      }
      
      // Ensure score is within bounds
      return Math.max(0, Math.min(100, score));
    },
    
    // Additional data sources for demo
    dataSources: [
      'etherscan',
      'demo-custom-api',
      'mock-reputation-service'
    ]
  }
};