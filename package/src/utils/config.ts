/**
 * Configuration Management for DeCap SDK
 * 
 * This module handles loading and merging configuration from various sources:
 * 1. Default configuration
 * 2. decap.config.js file
 * 3. Environment variables
 * 4. Runtime overrides
 */

export interface DeCapConfig {
  etherscan: {
    apiKey: string;
    network: 'mainnet' | 'sepolia' | 'goerli';
    timeout: number;
    rateLimit: number;
  };
  reputation: {
    thresholds: {
      bypass: number;
      simple: number;
      advanced: number;
    };
    weights: {
      transactionActivity: number;
      contractInteractions: number;
      walletAge: number;
      tokenDiversity: number;
      riskFlags: number;
    };
    cache: {
      ttl: number;
      maxEntries: number;
    };
  };
  security: {
    signTimeout: number;
    maxAttempts: number;
    nonceExpiry: number;
    verifySignatures: boolean;
  };
  ui: {
    defaultTheme: 'light' | 'dark' | 'auto';
    animations: {
      enabled: boolean;
      duration: number;
    };
    modal: {
      closeOnOverlayClick: boolean;
      showCloseButton: boolean;
      autoCloseDelay: number;
    };
  };
  development: {
    debug: boolean;
    useMockData: boolean;
    skipSignatureVerification: boolean;
  };
  customScoring: {
    enabled: boolean;
    scoringFunction: ((walletAddress: string) => Promise<number>) | null;
    dataSources: string[];
  };
}

// Default configuration
const defaultConfig: DeCapConfig = {
  etherscan: {
    apiKey: '',
    network: 'mainnet',
    timeout: 10000,
    rateLimit: 5
  },
  reputation: {
    thresholds: {
      bypass: 70,
      simple: 40,
      advanced: 0
    },
    weights: {
      transactionActivity: 30,
      contractInteractions: 20,
      walletAge: 20,
      tokenDiversity: 10,
      riskFlags: -20
    },
    cache: {
      ttl: 300000, // 5 minutes
      maxEntries: 1000
    }
  },
  security: {
    signTimeout: 300000, // 5 minutes
    maxAttempts: 3,
    nonceExpiry: 300000, // 5 minutes
    verifySignatures: true
  },
  ui: {
    defaultTheme: 'auto',
    animations: {
      enabled: true,
      duration: 300
    },
    modal: {
      closeOnOverlayClick: false,
      showCloseButton: true,
      autoCloseDelay: 2000
    }
  },
  development: {
    debug: false,
    useMockData: false,
    skipSignatureVerification: false
  },
  customScoring: {
    enabled: false,
    scoringFunction: null,
    dataSources: []
  }
};

let currentConfig: DeCapConfig = { ...defaultConfig };
let configLoaded = false;

/**
 * Deep merge two configuration objects
 */
function mergeConfig(target: any, source: any): any {
  const result = { ...target };
  
  for (const key in source) {
    if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = mergeConfig(target[key] || {}, source[key]);
    } else {
      result[key] = source[key];
    }
  }
  
  return result;
}

/**
 * Load configuration from environment variables
 */
function loadEnvironmentConfig(): Partial<DeCapConfig> {
  const envConfig: any = {};
  
  // Etherscan configuration
  if (process.env.ETHERSCAN_API_KEY) {
    envConfig.etherscan = {
      apiKey: process.env.ETHERSCAN_API_KEY
    };
  }
  
  if (process.env.ETHERSCAN_NETWORK) {
    envConfig.etherscan = {
      ...envConfig.etherscan,
      network: process.env.ETHERSCAN_NETWORK
    };
  }
  
  // Development settings
  if (process.env.NODE_ENV) {
    envConfig.development = {
      debug: process.env.NODE_ENV === 'development'
    };
  }
  
  if (process.env.DECAP_DEBUG) {
    envConfig.development = {
      ...envConfig.development,
      debug: process.env.DECAP_DEBUG === 'true'
    };
  }
  
  if (process.env.DECAP_USE_MOCK_DATA) {
    envConfig.development = {
      ...envConfig.development,
      useMockData: process.env.DECAP_USE_MOCK_DATA === 'true'
    };
  }
  
  return envConfig;
}

/**
 * Load configuration from decap.config.js file
 */
function loadConfigFile(): Partial<DeCapConfig> {
  // In browser environment, config file loading is not supported
  if (typeof window !== 'undefined') {
    return {};
  }
  
  // For now, return empty config - users can use environment variables or runtime config
  // TODO: Implement proper config file loading for Node.js environments
  return {};
}

/**
 * Initialize configuration by loading from all sources
 */
export async function initializeConfig(overrides: Partial<DeCapConfig> = {}): Promise<DeCapConfig> {
  if (configLoaded && Object.keys(overrides).length === 0) {
    return currentConfig;
  }
  
  try {
    // Start with default config
    let config = { ...defaultConfig };
    
    // Merge environment variables
    const envConfig = loadEnvironmentConfig();
    config = mergeConfig(config, envConfig);
    
    // Merge config file (only in Node.js environment)
    if (typeof window === 'undefined') {
      try {
        const fileConfig = loadConfigFile();
        config = mergeConfig(config, fileConfig);
      } catch (error) {
        // Ignore file loading errors in browser environment
      }
    }
    
    // Merge runtime overrides
    config = mergeConfig(config, overrides);
    
    // Validate configuration
    validateConfig(config);
    
    currentConfig = config;
    configLoaded = true;
    
    if (config.development.debug) {
      console.log('DeCap: Configuration loaded', config);
    }
    
    return config;
  } catch (error) {
    console.error('DeCap: Failed to initialize configuration:', error);
    return defaultConfig;
  }
}

/**
 * Get current configuration
 */
export function getConfig(): DeCapConfig {
  if (!configLoaded) {
    console.warn('DeCap: Configuration not initialized, using defaults');
    return defaultConfig;
  }
  return currentConfig;
}

/**
 * Update configuration at runtime
 */
export function updateConfig(updates: Partial<DeCapConfig>): DeCapConfig {
  currentConfig = mergeConfig(currentConfig, updates);
  
  if (currentConfig.development.debug) {
    console.log('DeCap: Configuration updated', updates);
  }
  
  return currentConfig;
}

/**
 * Validate configuration values
 */
function validateConfig(config: DeCapConfig): void {
  // Validate thresholds
  const { bypass, simple, advanced } = config.reputation.thresholds;
  if (bypass <= simple || simple <= advanced) {
    throw new Error('DeCap: Invalid reputation thresholds. Must be: bypass > simple > advanced');
  }
  
  // Validate weights (should add up to approximately 100, allowing for riskFlags being negative)
  const { weights } = config.reputation;
  const positiveWeights = weights.transactionActivity + weights.contractInteractions + 
                         weights.walletAge + weights.tokenDiversity;
  if (positiveWeights + Math.abs(weights.riskFlags) !== 100) {
    console.warn('DeCap: Reputation weights do not add up to 100, this may affect scoring accuracy');
  }
  
  // Validate API key for non-mock mode
  if (!config.development.useMockData && !config.etherscan.apiKey) {
    console.warn('DeCap: No Etherscan API key provided. Reputation scoring will use mock data.');
  }
  
  // Validate timeouts
  if (config.security.signTimeout < 30000) {
    console.warn('DeCap: Sign timeout is very short (<30s), users may not have enough time');
  }
  
  if (config.security.nonceExpiry < 60000) {
    console.warn('DeCap: Nonce expiry is very short (<1min), may cause verification failures');
  }
}

/**
 * Get configuration for a specific module
 */
export function getEtherscanConfig() {
  return getConfig().etherscan;
}

export function getReputationConfig() {
  return getConfig().reputation;
}

export function getSecurityConfig() {
  return getConfig().security;
}

export function getUIConfig() {
  return getConfig().ui;
}

export function getDevelopmentConfig() {
  return getConfig().development;
}

/**
 * Check if debug mode is enabled
 */
export function isDebugMode(): boolean {
  return getConfig().development.debug;
}

/**
 * Check if mock data should be used
 */
export function shouldUseMockData(): boolean {
  return getConfig().development.useMockData || !getConfig().etherscan.apiKey;
}

/**
 * Export configuration types for external use
 */


// Initialize configuration on module load (with defaults)
initializeConfig().catch(console.error);
