// DeCap SDK Configuration
// Copy this file to your project root and customize as needed

export default {
  // Gas payer configuration for transaction sponsorship
  gasPayer: {
    walletAddress: '0x0000000000000000000000000000000000000000', // Replace with your gas payer wallet
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', // Replace with your RPC URL
    chainId: 1, // 1 for mainnet, 5 for goerli, etc.
    gasLimit: 21000,
    maxFeePerGas: '20000000000', // 20 gwei
  },

  // UI theme configuration
  theme: 'light', // 'light' | 'dark'

  // Reputation thresholds for auto mode
  reputationThreshold: {
    bypass: 70,  // Score >= 70: Skip CAPTCHA entirely
    easy: 50,    // Score >= 50: Use simple mode
    // Score < 50: Use advanced mode (puzzle + wallet signing)
  },

  // Custom challenge configuration
  customChallenges: false, // Set to true to use custom puzzle words

  // Development settings
  development: {
    mockReputation: false, // Set to true to use mock reputation scores
    testMode: false,       // Set to true to use very low gas amounts for testing
  },
};