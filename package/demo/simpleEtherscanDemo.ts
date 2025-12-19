/**
 * Simple Etherscan Demo - Core Functions Only
 * 
 * This demo shows the core Etherscan integration without React components
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { 
  calculateWalletReputation, 
  getTrustLevel, 
  determineCaptchaMode,
  DEFAULT_CONFIG 
} from '../src/lib/customScoring';

// Parse .env file
function loadEnvFile() {
  try {
    const envPath = join(__dirname, '../.env');
    const envContent = readFileSync(envPath, 'utf8');
    const envVars: Record<string, string> = {};
    
    envContent.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn('Could not load .env file:', error.message);
    return {};
  }
}

async function runSimpleDemo() {
  console.log('🔗 Etherscan Integration Demo\n');

  // Test wallet addresses
  const testWallets = [
    '0x957c9ea2a3e698e50f42fe78e39184acc74ebb62', // Your wallet
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik Buterin
  ];

  // Load environment variables from .env file
  const envVars = loadEnvFile();
  const apiKey = envVars.API_KEY_TOKEN || process.env.ETHERSCAN_API_KEY || process.env.API_KEY_TOKEN;
  const hasApiKey = apiKey && apiKey !== 'YourApiKeyToken' && apiKey.length > 10;

  console.log(`🔑 API Key Status: ${hasApiKey ? '✅ Found' : '❌ Not found'}`);
  console.log(`📊 Data Source: ${hasApiKey ? 'Real Etherscan' : 'Fallback Data'}\n`);

  for (const wallet of testWallets) {
    console.log(`🔍 Analyzing: ${wallet}`);
    
    try {
      // Calculate reputation (will use real data with API key)
      const score = await calculateWalletReputation(
        wallet, 
        DEFAULT_CONFIG, 
        apiKey
      );
      
      const trustLevel = getTrustLevel(score);
      const captchaMode = determineCaptchaMode(score);
      
      console.log(`   Score: ${score}/100`);
      console.log(`   Trust Level: ${trustLevel.toUpperCase()}`);
      console.log(`   CAPTCHA Mode: ${captchaMode}`);
      console.log(`   Action: ${getCaptchaAction(captchaMode)}`);
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      console.log('');
    }
  }

  if (!hasApiKey) {
    console.log('💡 To test with real Etherscan data:');
    console.log('1. Get free API key: https://etherscan.io/apis');
    console.log('2. Add to .env file: API_KEY_TOKEN=your_key');
    console.log('3. Run demo again\n');
  }

  console.log('🛠️  Usage in your app:');
  console.log(`
// Basic usage (fallback data if no API key)
const score = await calculateWalletReputation(address);

// Production usage (real data with API key)
const score = await calculateWalletReputation(
  address,
  DEFAULT_CONFIG,
  process.env.ETHERSCAN_API_KEY
);

// Get trust level and CAPTCHA mode
const trustLevel = getTrustLevel(score);
const captchaMode = determineCaptchaMode(score);
`);
}

function getCaptchaAction(mode: string): string {
  switch (mode) {
    case 'bypass':
      return '✅ Skip CAPTCHA entirely (High Trust)';
    case 'simple':
      return '🟡 Show simple CAPTCHA (Medium Trust)';
    case 'advanced':
      return '🔴 Require full CAPTCHA + wallet signature (Low Trust)';
    default:
      return '❓ Unknown mode';
  }
}

// Run the demo
runSimpleDemo().catch(console.error);