export interface WalletConnection {
  address: string;
  isConnected: boolean;
  signMessage: (message: string) => Promise<string>;
}

class WalletManager {
  private address: string = '';

  async connect(): Promise<WalletConnection> {
    try {
      // Check if MetaMask is installed
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
        // Request account access
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        });
        
        this.address = accounts[0];
        
        return {
          address: this.address,
          isConnected: true,
          signMessage: this.signMessage.bind(this)
        };
      } else {
        console.log('MetaMask not detected, using mock wallet');
        // Fallback to mock wallet if MetaMask not available
        return this.getMockWallet();
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      // Fallback to mock wallet on error
      return this.getMockWallet();
    }
  }

  private async signMessage(message: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined' && this.address) {
        // Use personal_sign method directly
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, this.address]
        });
        return signature;
      } else {
        // Fallback to mock signature
        await new Promise(resolve => setTimeout(resolve, 2000));
        return `0x${'a'.repeat(130)}${Date.now().toString(16)}`;
      }
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  private getMockWallet(): WalletConnection {
    return {
      address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
      isConnected: true,
      signMessage: async (message: string): Promise<string> => {
        // Simulate wallet signing delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Mock signature (in real app, this would be actual wallet signature)
        return `0x${'a'.repeat(130)}${Date.now().toString(16)}`;
      }
    };
  }
}

export const walletManager = new WalletManager();

// For backward compatibility
export const mockWallet: WalletConnection = {
  address: '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
  isConnected: true,
  signMessage: async (message: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return `0x${'a'.repeat(130)}${Date.now().toString(16)}`;
  }
};