import { Wallet, ArrowUpRight, ArrowDownLeft, Coins, X, Check, AlertCircle } from "lucide-react";
import { Layout } from "@/components/Layout";
import { DeCap } from "decap-sdk";
import { walletManager, type WalletConnection } from "@/utils/mockWallet";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const WalletPage = () => {
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [balance, setBalance] = useState(12.4);
  const [isTransferring, setIsTransferring] = useState(false);
  const [transferStep, setTransferStep] = useState<'form' | 'confirm' | 'processing' | 'success'>('form');

  // Connect wallet on component mount
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const walletConnection = await walletManager.connect();
        setWallet(walletConnection);
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast.error("Wallet Connection Failed", {
          description: "Using demo mode instead.",
          duration: 3000,
        });
      }
    };

    connectWallet();
  }, []);

  const handleSendClick = () => {
    setShowSendModal(true);
    setTransferStep('form');
    setSendAmount("");
    setRecipientAddress("");
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sendAmount || !recipientAddress) {
      toast.error("Please fill in all fields");
      return;
    }
    if (parseFloat(sendAmount) > balance) {
      toast.error("Insufficient balance");
      return;
    }
    setTransferStep('confirm');
  };

  const handleTransferSuccess = (proof: any) => {
    console.log('✅ DeCap Transfer Verification Success:', proof);
    setTransferStep('processing');
    
    // Simulate transfer processing
    setTimeout(() => {
      const amount = parseFloat(sendAmount);
      setBalance(prev => prev - amount);
      setTransferStep('success');
      
      toast.success("🎉 Transfer Successful!", {
        description: `Sent ${amount} VRC to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
        duration: 4000,
      });

      // Auto-close after 3 seconds
      setTimeout(() => {
        setShowSendModal(false);
      }, 3000);
    }, 2000);
  };

  const handleTransferFailure = () => {
    console.log('❌ DeCap Transfer Verification Failed');
    toast.error("Verification Failed", {
      description: "Transfer cancelled for security.",
      duration: 3000,
    });
  };

  const closeModal = () => {
    setShowSendModal(false);
  };

  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Wallet</h1>
        </div>
        
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-primary/30 to-primary/10 rounded-3xl p-6 mb-6">
          <p className="text-muted-foreground mb-2">Total Balance</p>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold text-foreground">{balance.toFixed(1)}</span>
            <span className="text-xl text-primary font-semibold">VRC</span>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={handleSendClick}
              className="flex-1 py-3 rounded-xl gradient-purple text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <ArrowUpRight className="w-5 h-5" />
              Send
            </button>
            <button className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-colors">
              <ArrowDownLeft className="w-5 h-5" />
              Receive
            </button>
          </div>
        </div>
        
        {/* Assets */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Assets</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
              <div className="w-12 h-12 rounded-full gradient-purple flex items-center justify-center">
                <span className="text-lg font-bold text-primary-foreground">V</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">VeryChat Token</p>
                <p className="text-sm text-muted-foreground">VRC</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">{balance.toFixed(1)}</p>
                <p className="text-sm text-muted-foreground">$0.00</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
              <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center">
                <Coins className="w-6 h-6 text-background" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Credits</p>
                <p className="text-sm text-muted-foreground">CRD</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">0.0</p>
                <p className="text-sm text-muted-foreground">$0.00</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Send Modal */}
      {showSendModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-2xl w-full max-w-md p-6 relative">
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Transfer Form */}
            {transferStep === 'form' && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Send VRC</h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Recipient Address
                    </label>
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => setRecipientAddress(e.target.value)}
                      placeholder="0x742d35Cc6634C0532925a3b8D4C9db96590c6C87"
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Amount (VRC)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.0"
                      max={balance}
                      className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Available: {balance.toFixed(1)} VRC
                    </p>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    Continue
                  </button>
                </form>
              </div>
            )}

            {/* Confirmation Step */}
            {transferStep === 'confirm' && (
              <div>
                <h2 className="text-xl font-bold text-foreground mb-6">Confirm Transfer</h2>
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-secondary/50 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">To:</span>
                      <span className="text-sm font-mono text-foreground">
                        {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-muted-foreground">Amount:</span>
                      <span className="text-lg font-bold text-foreground">{sendAmount} VRC</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Network Fee:</span>
                      <span className="text-sm text-foreground">0.001 VRC</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-600">
                      This transaction is protected by DeCap security verification
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setTransferStep('form')}
                    className="flex-1 py-3 bg-secondary text-foreground font-semibold rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    Back
                  </button>
                  
                  <div className="flex-1">
                    <DeCap
                      mode="advanced"
                      userWallet={wallet}
                      onSuccess={handleTransferSuccess}
                      onFailure={handleTransferFailure}
                      theme="auto"
                    >
                      <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-colors">
                        Send
                      </button>
                    </DeCap>
                  </div>
                </div>
              </div>
            )}

            {/* Processing Step */}
            {transferStep === 'processing' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-xl font-bold text-foreground mb-2">Processing Transfer</h2>
                <p className="text-muted-foreground">Please wait while your transaction is being processed...</p>
              </div>
            )}

            {/* Success Step */}
            {transferStep === 'success' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">Transfer Successful!</h2>
                <p className="text-muted-foreground mb-4">
                  {sendAmount} VRC has been sent to<br />
                  {recipientAddress.slice(0, 6)}...{recipientAddress.slice(-4)}
                </p>
                <button
                  onClick={closeModal}
                  className="px-6 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default WalletPage;