/**
 * DeCap Configuration Demo
 * 
 * This demo shows how to use the DeCap configuration system
 * to customize behavior and integrate with your application.
 */

import { 
  initializeConfig, 
  getConfig, 
  updateConfig,
  getEtherscanConfig,
  getReputationConfig,
  isDebugMode,
  shouldUseMockData
} from '../dist/index.js';

/**
 * Demo 1: Basic Configuration Loading
 */
async function demoBasicConfiguration() {
  console.log('🔧 Demo 1: Basic Configuration Loading\n');
  
  // Initialize configuration (loads from file + environment)
  const config = await initializeConfig();
  
  console.log('Configuration loaded:');
  console.log('- Etherscan API Key:', config.etherscan.apiKey ? '✅ Set' : '❌ Not set');
  console.log('- Network:', config.etherscan.network);
  console.log('- Debug Mode:', config.development.debug ? '✅ Enabled' : '❌ Disabled');
  console.log('- Use Mock Data:', config.development.useMockData ? '✅ Yes' : '❌ No');
  console.log('- Reputation Thresholds:', config.reputation.thresholds);
  console.log('');
}

/**
 * Demo 2: Runtime Configuration Updates
 */
function demoRuntimeUpdates() {
  console.log('🔧 Demo 2: Runtime Configuration Updates\n');
  
  console.log('Current Etherscan config:', getEtherscanConfig());
  
  try {
    // Update configuration at runtime
    updateConfig({
      etherscan: {
        apiKey: 'demo-updated-key',
        network: 'mainnet',
        timeout: 20000,
        rateLimit: 5
      },
      development: {
        debug: true,
        useMockData: false,
        skipSignatureVerification: false
      }
    });
    
    console.log('Updated Etherscan config:', getEtherscanConfig());
    console.log('Debug mode now:', isDebugMode());
  } catch (error) {
    console.error('Error updating config:', error.message);
    console.log('Using current configuration instead');
  }
  console.log('');
}

/**
 * Demo 3: Environment-Based Configuration
 */
function demoEnvironmentConfig() {
  console.log('🔧 Demo 3: Environment-Based Configuration\n');
  
  // Show how environment variables affect configuration
  console.log('Environment variables:');
  console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
  console.log('- ETHERSCAN_API_KEY:', process.env.ETHERSCAN_API_KEY ? '✅ Set' : '❌ Not set');
  
  console.log('\nConfiguration behavior:');
  console.log('- Should use mock data:', shouldUseMockData());
  console.log('- Debug mode enabled:', isDebugMode());
  console.log('');
}

/**
 * Demo 4: Module-Specific Configuration
 */
function demoModuleSpecificConfig() {
  console.log('🔧 Demo 4: Module-Specific Configuration\n');
  
  const reputationConfig = getReputationConfig();
  
  console.log('Reputation Configuration:');
  console.log('- Bypass threshold:', reputationConfig.thresholds.bypass);
  console.log('- Simple threshold:', reputationConfig.thresholds.simple);
  console.log('- Advanced threshold:', reputationConfig.thresholds.advanced);
  console.log('- Cache TTL:', reputationConfig.cache.ttl, 'ms');
  console.log('- Scoring weights:', reputationConfig.weights);
  console.log('');
}

/**
 * Demo 5: Configuration Validation
 */
function demoConfigValidation() {
  console.log('🔧 Demo 5: Configuration Validation\n');
  
  const config = getConfig();
  
  // Check configuration validity
  const validations = [
    {
      name: 'Thresholds are properly ordered',
      valid: config.reputation.thresholds.bypass > config.reputation.thresholds.simple &&
             config.reputation.thresholds.simple > config.reputation.thresholds.advanced,
      current: `${config.reputation.thresholds.bypass} > ${config.reputation.thresholds.simple} > ${config.reputation.thresholds.advanced}`
    },
    {
      name: 'Timeouts are reasonable',
      valid: config.security.signTimeout >= 30000 && config.security.nonceExpiry >= 60000,
      current: `Sign: ${config.security.signTimeout}ms, Nonce: ${config.security.nonceExpiry}ms`
    },
    {
      name: 'API key is available for production',
      valid: config.development.useMockData || !!config.etherscan.apiKey,
      current: config.development.useMockData ? 'Using mock data' : 'Using real API'
    }
  ];
  
  console.log('Configuration Validation:');
  validations.forEach(validation => {
    console.log(`- ${validation.name}: ${validation.valid ? '✅' : '❌'} (${validation.current})`);
  });
  console.log('');
}

/**
 * Demo 6: Custom Configuration for Different Environments
 */
function demoEnvironmentSpecificConfig() {
  console.log('🔧 Demo 6: Environment-Specific Configuration\n');
  
  // Simulate different environment configurations
  const environments: Record<string, Partial<any>> = {
    development: {
      etherscan: { timeout: 15000 },
      development: { debug: true, useMockData: true },
      reputation: { thresholds: { bypass: 60, simple: 30, advanced: 0 } }
    },
    staging: {
      etherscan: { timeout: 10000 },
      development: { debug: true, useMockData: false },
      reputation: { thresholds: { bypass: 70, simple: 40, advanced: 0 } }
    },
    production: {
      etherscan: { timeout: 8000 },
      development: { debug: false, useMockData: false },
      reputation: { thresholds: { bypass: 80, simple: 50, advanced: 0 } }
    }
  };
  
  const currentEnv = process.env.NODE_ENV || 'development';
  console.log(`Current environment: ${currentEnv}`);
  
  if (environments[currentEnv]) {
    console.log('Recommended configuration for this environment:');
    console.log(JSON.stringify(environments[currentEnv], null, 2));
    
    // Apply environment-specific configuration
    updateConfig(environments[currentEnv]);
    console.log('✅ Environment-specific configuration applied');
  } else {
    console.log('⚠️ Unknown environment, using default configuration');
  }
  console.log('');
}

/**
 * Run all configuration demos
 */
async function runConfigurationDemo() {
  console.log('🚀 DeCap Configuration System Demo\n');
  console.log('='.repeat(60));
  
  try {
    await demoBasicConfiguration();
    demoRuntimeUpdates();
    demoEnvironmentConfig();
    demoModuleSpecificConfig();
    demoConfigValidation();
    demoEnvironmentSpecificConfig();
    
    console.log('='.repeat(60));
    console.log('📊 Demo Summary:');
    console.log('✅ Configuration loading from multiple sources');
    console.log('✅ Runtime configuration updates');
    console.log('✅ Environment variable integration');
    console.log('✅ Module-specific configuration access');
    console.log('✅ Configuration validation');
    console.log('✅ Environment-specific configurations');
    
    console.log('\n💡 Next Steps:');
    console.log('1. Create a decap.config.js file in your project root');
    console.log('2. Set ETHERSCAN_API_KEY environment variable');
    console.log('3. Customize thresholds and timeouts for your use case');
    console.log('4. Use updateConfig() for runtime adjustments');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run the demo
runConfigurationDemo().catch(console.error);