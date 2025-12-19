/**
 * Demo: Custom Reputation Scoring System
 * 
 * This demo shows how to use the new custom reputation scoring system
 * as a standalone function that can be imported into any dapp.
 */

import { 
  calculateWalletReputation, 
  generateMockWalletData, 
  getTrustLevel, 
  determineCaptchaMode,
  DEFAULT_CONFIG 
} from '../src/lib/customScoring';

async function runDemo() {
  console.log('🎯 Custom Reputation Scoring System Demo\n');

  // Example wallet addresses
  const wallets = [
    '0x1234567890123456789012345678901234567890', // High activity
    '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd', // Medium activity  
    '0x0000000000000000000000000000000000000001', // Low activity
  ];

  console.log('📊 Analyzing wallet reputations...\n');

  for (const wallet of wallets) {
    console.log(`🔍 Wallet: ${wallet}`);
    
    // Calculate reputation score
    const score = await calculateWalletReputation(wallet);
    const trustLevel = getTrustLevel(score);
    const captchaMode = determineCaptchaMode(score);
    
    // Get detailed wallet data
    const walletData = generateMockWalletData(wallet);
    
    console.log(`   Score: ${score}/100`);
    console.log(`   Trust Level: ${trustLevel.toUpperCase()}`);
    console.log(`   CAPTCHA Mode: ${captchaMode}`);
    console.log(`   Transactions: ${walletData.transactionCount}`);
    console.log(`   Contract Interactions: ${walletData.contractInteractions}`);
    console.log(`   Known Protocols: ${walletData.knownProtocolInteractions.join(', ') || 'None'}`);
    console.log(`   Wallet Age: ${Math.floor(walletData.walletAge / 30)} months`);
    console.log(`   Assets: ${walletData.tokenCount + walletData.nftCount} (${walletData.tokenCount} tokens, ${walletData.nftCount} NFTs)`);
    console.log(`   Risk Flags: ${walletData.riskFlags.length > 0 ? walletData.riskFlags.map(f => f.type).join(', ') : 'None'}`);
    
    // Show what happens in dapp
    console.log(`   🎮 In DApp: ${getCaptchaAction(captchaMode)}`);
    console.log('');
  }

  console.log('💡 Usage in your dapp:');
  console.log(`
import { calculateWalletReputation } from 'decap-sdk';

// Use as atom or in component
const score = await calculateWalletReputation(walletAddress);

// Integrate with state management
const [reputationScore, setReputationScore] = useState(null);
useEffect(() => {
  calculateWalletReputation(wallet.address).then(setReputationScore);
}, [wallet.address]);
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
runDemo().catch(console.error);