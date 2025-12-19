/**
 * Demo: Real Etherscan Data Integration
 * 
 * This demo shows how to use the Etherscan API integration to fetch
 * real onchain data for wallet reputation scoring.
 */

import { 
  calculateWalletReputation, 
  fetchRealWalletData,
  EtherscanAPI,
  getTrustLevel, 
  determineCaptchaMode,
  DEFAULT_CONFIG 
} from '../src/index';

async function runEtherscanDemo() {
  console.log('🔗 Etherscan API Integration Demo\n');

  // Example: Well-known Ethereum addresses with real activity
  const testWallets = [
    '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', // Vitalik Buterin
    '0x3f5CE5FBFe3E9af3971dD833D26bA9b5C936f0bE', // Binance Hot Wallet
    '0x28C6c06298d514Db089934071355E5743bf21d60', // Binance 14
  ];

  console.log('⚠️  Note: This demo can use your ETHERSCAN_API_KEY environment variable');
  console.log('Get your free API key at: https://etherscan.io/apis\n');
  
  const apiKey = process.env.ETHERSCAN_API_KEY;
  if (apiKey && apiKey !== 'YourApiKeyToken') {
    console.log('🔑 Found API key in environment, will use real data!\n');
  } else {
    console.log('💡 No API key found, using mock data for demo\n');
  }

  // Demo with mock data first
  console.log('📊 Demo 1: Using Mock Data (Development Mode)\n');
  
  for (const wallet of testWallets.slice(0, 1)) { // Just test one for demo
    console.log(`🔍 Analyzing: ${wallet}`);
    
    try {
      // Calculate reputation with mock data
      const mockScore = await calculateWalletReputation(wallet, DEFAULT_CONFIG, true);
      
      console.log(`   Mock Score: ${mockScore}/100`);
      console.log(`   Trust Level: ${getTrustLevel(mockScore).toUpperCase()}`);
      console.log(`   CAPTCHA Mode: ${determineCaptchaMode(mockScore)}`);
      console.log('');
      
    } catch (error) {
      console.error(`   ❌ Error: ${error}`);
    }
  }

  // Demo with real data (requires API key)
  console.log('📊 Demo 2: Using Real Etherscan Data (Production Mode)\n');
  console.log('💡 To test with real data, set ETHERSCAN_API_KEY environment variable\n');
  
  if (apiKey === 'YourApiKeyToken') {
    console.log('⚠️  Skipping real data demo - no API key provided');
    console.log('   Set ETHERSCAN_API_KEY environment variable to test real data\n');
  } else {
    console.log('🔑 Using provided API key for real data...\n');
    
    for (const wallet of testWallets.slice(0, 1)) {
      console.log(`🔍 Fetching real data for: ${wallet}`);
      
      try {
        // Fetch real wallet data
        const realScore = await calculateWalletReputation(
          wallet, 
          DEFAULT_CONFIG, 
          false, // Use real data
          apiKey
        );
        
        console.log(`   Real Score: ${realScore}/100`);
        console.log(`   Trust Level: ${getTrustLevel(realScore).toUpperCase()}`);
        console.log(`   CAPTCHA Mode: ${determineCaptchaMode(realScore)}`);
        console.log('');
        
      } catch (error) {
        console.error(`   ❌ Error fetching real data: ${error}`);
        console.log('   This might be due to API rate limits or invalid API key\n');
      }
    }
  }

  console.log('🛠️  Integration Examples:\n');
  
  console.log('// Basic usage with mock data (development)');
  console.log('const score = await calculateWalletReputation(address);');
  console.log('');
  
  console.log('// Production usage with real Etherscan data');
  console.log('const score = await calculateWalletReputation(');
  console.log('  address,');
  console.log('  DEFAULT_CONFIG,');
  console.log('  false, // Use real data');
  console.log('  "your-etherscan-api-key"');
  console.log(');');
  console.log('');
  
  console.log('// Direct Etherscan API usage');
  console.log('import { EtherscanAPI, fetchRealWalletData } from "decap-sdk";');
  console.log('');
  console.log('const api = new EtherscanAPI({ apiKey: "your-key" });');
  console.log('const transactions = await api.getTransactions(address);');
  console.log('const walletData = await fetchRealWalletData(address, { apiKey });');
  console.log('');

  console.log('🎯 Benefits of Real Data:');
  console.log('• Accurate transaction counts and contract interactions');
  console.log('• Real wallet age calculation from first transaction');
  console.log('• Actual token/NFT diversity detection');
  console.log('• Tornado Cash and risk pattern detection');
  console.log('• Known DeFi protocol interaction bonuses');
  console.log('');
}

// Run the demo
runEtherscanDemo().catch(console.error);