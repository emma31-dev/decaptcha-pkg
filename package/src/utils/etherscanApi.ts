/**
 * Etherscan API Integration for Real Blockchain Data
 * 
 * This module provides utilities to fetch real onchain data from Etherscan API
 * for calculating accurate wallet reputation scores.
 */

import { WalletData, RiskFlag } from '../types';

// Etherscan API configuration - Using V2 endpoints
const ETHERSCAN_API_V2_URL = 'https://api.etherscan.io/v2/api';
const DEFAULT_API_KEY = process.env.ETHERSCAN_API_KEY || 'YourApiKeyToken'; // Users should provide their own API key

// Known DeFi protocol contract addresses for bonus scoring
export const KNOWN_PROTOCOL_ADDRESSES: Record<string, string> = {
  // Uniswap
  '0x7a250d5630b4cf539739df2c5dacb4c659f2488d': 'uniswap_v2_router',
  '0xe592427a0aece92de3edee1f18e0157c05861564': 'uniswap_v3_router',
  '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45': 'uniswap_v3_router2',
  
  // Aave
  '0x7d2768de32b0b80b7a3454c06bdac94a69ddc7a9': 'aave_lending_pool',
  '0x87870bced4dd9d65f45c0b0847c88634c9c0f9f1': 'aave_v3_pool',
  
  // Compound
  '0x3d9819210a31b4961b30ef54be2aed79b9c9cd3b': 'compound_comptroller',
  '0xc00e94cb662c3520282e6f5717214004a7f26888': 'compound_governance',
  
  // MakerDAO
  '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2': 'maker_mkr',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'maker_dai',
  
  // Curve
  '0xd51a44d3fae010294c616388b506acda1bfaae46': 'curve_tricrypto',
  '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7': 'curve_3pool',
  
  // ENS
  '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85': 'ens_registrar',
  '0x314159265dd8dbb310642f98f50c066173c1259b': 'ens_registry',
  
  // Tornado Cash (risk flag)
  '0x12d66f87a04a9e220743712ce6d9bb1b5616b8fc': 'tornado_cash_0.1_eth',
  '0x47ce0c6ed5b0ce3d3a51fdb1c52dc66a7c3c2936': 'tornado_cash_1_eth',
  '0x910cbd523d972eb0a6f4cae4618ad62622b39dbf': 'tornado_cash_10_eth',
  '0xa160cdab225685da1d56aa342ad8841c3b53f291': 'tornado_cash_100_eth'
};

// Risk patterns for transaction analysis
const RISK_PATTERNS = {
  TORNADO_CASH: Object.keys(KNOWN_PROTOCOL_ADDRESSES).filter(addr => 
    KNOWN_PROTOCOL_ADDRESSES[addr].includes('tornado_cash')
  ),
  LARGE_TRANSACTION_THRESHOLD: 10, // ETH
  SUSPICIOUS_ACTIVITY_WINDOW: 24 * 60 * 60 * 1000 // 24 hours in ms
};

export interface EtherscanConfig {
  apiKey?: string;
  network?: 'mainnet' | 'goerli' | 'sepolia';
  timeout?: number;
  retries?: number;
}

export interface EtherscanTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  contractAddress?: string;
  input: string;
}

export interface EtherscanTokenBalance {
  contractAddress: string;
  tokenName: string;
  tokenSymbol: string;
  tokenDecimal: string;
  balance: string;
}

export interface EtherscanApiResponse<T> {
  status: string;
  message: string;
  result: T;
}

/**
 * Etherscan API client for fetching blockchain data
 */
export class EtherscanAPI {
  private apiKey: string;
  private baseUrl: string;
  private timeout: number;
  private retries: number;

  constructor(config: EtherscanConfig = {}) {
    this.apiKey = config.apiKey || DEFAULT_API_KEY;
    this.baseUrl = this.getNetworkUrl(config.network || 'mainnet');
    this.timeout = config.timeout || 10000;
    this.retries = config.retries || 3;
  }

  private getNetworkUrl(network: string): string {
    switch (network) {
      case 'goerli':
        return 'https://api-goerli.etherscan.io/v2/api';
      case 'sepolia':
        return 'https://api-sepolia.etherscan.io/v2/api';
      default:
        return 'https://api.etherscan.io/v2/api';
    }
  }

  private async makeRequest<T>(params: Record<string, string>): Promise<T> {
    const url = new URL(this.baseUrl);
    url.searchParams.append('apikey', this.apiKey);
    url.searchParams.append('chainid', '1'); // Ethereum mainnet chainid for V2 API
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url.toString(), {
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data: EtherscanApiResponse<T> = await response.json();

        if (data.status === '0' && data.message !== 'No transactions found') {
          throw new Error(`Etherscan API error: ${data.message}`);
        }

        return data.result;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        if (attempt < this.retries - 1) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
    }

    throw lastError || new Error('Failed to fetch data from Etherscan');
  }

  /**
   * Get transaction list for an address
   */
  async getTransactions(address: string, startBlock = 0, endBlock = 99999999): Promise<EtherscanTransaction[]> {
    return this.makeRequest<EtherscanTransaction[]>({
      module: 'account',
      action: 'txlist',
      address,
      startblock: startBlock.toString(),
      endblock: endBlock.toString(),
      page: '1',
      offset: '1000',
      sort: 'desc'
    });
  }

  /**
   * Get internal transactions (contract interactions)
   */
  async getInternalTransactions(address: string): Promise<EtherscanTransaction[]> {
    return this.makeRequest<EtherscanTransaction[]>({
      module: 'account',
      action: 'txlistinternal',
      address,
      page: '1',
      offset: '1000',
      sort: 'desc'
    });
  }

  /**
   * Get ERC-20 token transfers
   */
  async getTokenTransfers(address: string): Promise<EtherscanTransaction[]> {
    return this.makeRequest<EtherscanTransaction[]>({
      module: 'account',
      action: 'tokentx',
      address,
      page: '1',
      offset: '1000',
      sort: 'desc'
    });
  }

  /**
   * Get ERC-721 NFT transfers
   */
  async getNFTTransfers(address: string): Promise<EtherscanTransaction[]> {
    return this.makeRequest<EtherscanTransaction[]>({
      module: 'account',
      action: 'tokennfttx',
      address,
      page: '1',
      offset: '1000',
      sort: 'desc'
    });
  }

  /**
   * Get ETH balance
   */
  async getBalance(address: string): Promise<string> {
    return this.makeRequest<string>({
      module: 'account',
      action: 'balance',
      address,
      tag: 'latest'
    });
  }
}

/**
 * Analyzes transactions to detect risk flags
 */
export function analyzeRiskFlags(transactions: EtherscanTransaction[]): RiskFlag[] {
  const riskFlags: RiskFlag[] = [];
  const now = Date.now();

  // Check for Tornado Cash interactions
  const tornadoInteractions = transactions.filter(tx => 
    RISK_PATTERNS.TORNADO_CASH.includes(tx.to?.toLowerCase() || '')
  );

  if (tornadoInteractions.length > 0) {
    riskFlags.push({
      type: 'tornado_cash',
      severity: -30,
      description: `Detected ${tornadoInteractions.length} Tornado Cash interaction(s)`
    });
  }

  // Check for large transactions in recent period
  const recentLargeTransactions = transactions.filter(tx => {
    const txTime = parseInt(tx.timeStamp) * 1000;
    const value = parseFloat(tx.value) / 1e18; // Convert wei to ETH
    
    return (now - txTime) < RISK_PATTERNS.SUSPICIOUS_ACTIVITY_WINDOW && 
           value > RISK_PATTERNS.LARGE_TRANSACTION_THRESHOLD;
  });

  if (recentLargeTransactions.length > 0) {
    const isInflow = recentLargeTransactions.some(tx => tx.to?.toLowerCase() === tx.from?.toLowerCase());
    
    riskFlags.push({
      type: isInflow ? 'large_inflow' : 'large_outflow',
      severity: -10,
      description: `Detected ${recentLargeTransactions.length} large transaction(s) in last 24h`
    });
  }

  return riskFlags;
}

/**
 * Detects known protocol interactions
 */
export function detectProtocolInteractions(transactions: EtherscanTransaction[]): string[] {
  const protocols = new Set<string>();

  transactions.forEach(tx => {
    const toAddress = tx.to?.toLowerCase();
    if (toAddress && KNOWN_PROTOCOL_ADDRESSES[toAddress]) {
      const protocol = KNOWN_PROTOCOL_ADDRESSES[toAddress];
      if (!protocol.includes('tornado_cash')) { // Exclude risk protocols
        protocols.add(protocol.split('_')[0]); // Get base protocol name
      }
    }
  });

  return Array.from(protocols);
}

/**
 * Calculates wallet age from first transaction
 */
export function calculateWalletAge(transactions: EtherscanTransaction[]): number {
  if (transactions.length === 0) return 0;

  // Sort by timestamp ascending to get first transaction
  const sortedTxs = [...transactions].sort((a, b) => 
    parseInt(a.timeStamp) - parseInt(b.timeStamp)
  );

  const firstTxTime = parseInt(sortedTxs[0].timeStamp) * 1000;
  const ageInMs = Date.now() - firstTxTime;
  
  return Math.floor(ageInMs / (24 * 60 * 60 * 1000)); // Convert to days
}

/**
 * Counts unique tokens and NFTs
 */
export function countAssets(
  tokenTransfers: EtherscanTransaction[], 
  nftTransfers: EtherscanTransaction[]
): { tokenCount: number; nftCount: number } {
  const uniqueTokens = new Set(
    tokenTransfers.map(tx => tx.contractAddress?.toLowerCase()).filter(Boolean)
  );
  
  const uniqueNFTs = new Set(
    nftTransfers.map(tx => tx.contractAddress?.toLowerCase()).filter(Boolean)
  );

  return {
    tokenCount: uniqueTokens.size,
    nftCount: uniqueNFTs.size
  };
}

/**
 * Main function to fetch real wallet data from Etherscan
 */
export async function fetchRealWalletData(
  address: string, 
  config: EtherscanConfig = {}
): Promise<WalletData> {
  const api = new EtherscanAPI(config);

  try {
    // Fetch all data in parallel
    const [
      transactions,
      internalTxs,
      tokenTransfers,
      nftTransfers
    ] = await Promise.all([
      api.getTransactions(address),
      api.getInternalTransactions(address).catch(() => []), // Internal txs might fail
      api.getTokenTransfers(address).catch(() => []),
      api.getNFTTransfers(address).catch(() => [])
    ]);

    // Analyze the data
    const allTransactions = [...transactions, ...internalTxs];
    const riskFlags = analyzeRiskFlags(allTransactions);
    const knownProtocolInteractions = detectProtocolInteractions(allTransactions);
    const walletAge = calculateWalletAge(transactions);
    const { tokenCount, nftCount } = countAssets(tokenTransfers, nftTransfers);

    // Check for no activity
    if (transactions.length === 0) {
      riskFlags.push({
        type: 'no_activity',
        severity: -20,
        description: 'Wallet has no transaction history'
      });
    }

    const walletData: WalletData = {
      address,
      transactionCount: transactions.length,
      contractInteractions: internalTxs.length,
      knownProtocolInteractions,
      walletAge,
      tokenCount,
      nftCount,
      riskFlags,
      lastActivity: transactions.length > 0 ? parseInt(transactions[0].timeStamp) * 1000 : 0
    };

    console.log(`✅ Fetched real wallet data for ${address}:`, {
      transactions: walletData.transactionCount,
      contracts: walletData.contractInteractions,
      protocols: walletData.knownProtocolInteractions,
      age: `${Math.floor(walletData.walletAge / 30)} months`,
      assets: `${walletData.tokenCount + walletData.nftCount} total`,
      risks: walletData.riskFlags.length
    });

    return walletData;

  } catch (error) {
    console.error(`❌ Failed to fetch real wallet data for ${address}:`, error);
    throw error;
  }
}

/**
 * Creates a default Etherscan API instance
 */
export const defaultEtherscanAPI = new EtherscanAPI();

export default {
  EtherscanAPI,
  fetchRealWalletData,
  analyzeRiskFlags,
  detectProtocolInteractions,
  calculateWalletAge,
  countAssets,
  KNOWN_PROTOCOL_ADDRESSES,
  RISK_PATTERNS
};