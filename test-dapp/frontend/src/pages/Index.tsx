import { Settings, Coins } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MissionCard } from "@/components/MissionCard";
import { ProductCard } from "@/components/ProductCard";
import { DeCap } from "decap-sdk";
import { walletManager, type WalletConnection } from "@/utils/mockWallet";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
// Use logo as URL
const logo = "/src/assets/logo.svg";

const Index = () => {
  const navigate = useNavigate();
  const [coins, setCoins] = useState(0.0);
  const [cookieBalance, setCookieBalance] = useState(1250);
  const [veryAmount, setVeryAmount] = useState(12.4);
  const [isClaimingReward, setIsClaimingReward] = useState(false);
  const [wallet, setWallet] = useState<WalletConnection | null>(null);
  const [isConnectingWallet, setIsConnectingWallet] = useState(false);

  // Connect wallet on component mount
  useEffect(() => {
    const connectWallet = async () => {
      setIsConnectingWallet(true);
      try {
        const walletConnection = await walletManager.connect();
        setWallet(walletConnection);
        
        if (walletConnection.address !== '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87') {
          toast.success("Wallet Connected!", {
            description: `Connected to ${walletConnection.address.slice(0, 6)}...${walletConnection.address.slice(-4)}`,
            duration: 3000,
          });
        }
      } catch (error) {
        console.error('Failed to connect wallet:', error);
        toast.error("Wallet Connection Failed", {
          description: "Using demo mode instead.",
          duration: 3000,
        });
      } finally {
        setIsConnectingWallet(false);
      }
    };

    connectWallet();
  }, []);

  const handleClaimSuccess = (proof: any) => {
    console.log('✅ DeCap Verification Success:', proof);
    
    // Simulate claiming 50,000 coins
    setCoins(prev => prev + 50000);
    setIsClaimingReward(false);
    
    toast.success("🎉 Reward Claimed!", {
      description: "You've successfully earned 50,000 coins with DeCap verification!",
      duration: 4000,
    });
  };

  const handleClaimFailure = () => {
    console.log('❌ DeCap Verification Failed');
    setIsClaimingReward(false);
    
    toast.error("Verification Failed", {
      description: "Please try again to claim your reward.",
      duration: 3000,
    });
  };

  const handleLuckyCookieSuccess = (proof: any) => {
    console.log('✅ Lucky Cookie DeCap Success:', proof);
    
    // Simulate getting a lucky cookie
    setCookieBalance(prev => prev + 1);
    
    toast.success("🍪 Lucky Cookie!", {
      description: "You've earned a lucky cookie!",
      duration: 4000,
    });
  };

  const handleLuckyCookieFailure = () => {
    console.log('❌ Lucky Cookie DeCap Failed');
    
    toast.error("Verification Failed", {
      description: "Please try again to get your lucky cookie.",
      duration: 3000,
    });
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative h-[100vh] lg:h-[40rem] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-30" />
        
        {/* Top Bar with Balances and Settings */}
        <div className="absolute top-4 left-4 right-4 lg:top-6 lg:left-6 lg:right-6 z-20 flex items-center justify-between">
          {/* Balance Bar */}
          <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-full px-4 py-2">
            {/* Coin Balance */}
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-gold" />
              <span className="font-semibold text-foreground text-sm">{coins.toLocaleString()}</span>
            </div>
            
            {/* Separator */}
            <div className="w-px h-4 bg-muted-foreground/30"></div>
            
            {/* VERY Balance */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="VERY" className="w-4 h-4 object-contain flex-shrink-0" />
              <span className="font-semibold text-foreground text-sm">{veryAmount}</span>
            </div>
          </div>

          {/* Settings Button */}
          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <Settings className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col items-start justify-start text-left px-4 lg:px-8 pt-40 mb-32">
          {/* Get a Lucky Cookie | 11 steps */}
          <div className="mb-6">
            <h1 className="text-xl lg:text-2xl font-bold text-foreground mb-2">Get a Lucky Cookie</h1>
            <p className="text-3xl lg:text-4xl font-bold text-foreground">11 steps</p>
          </div>

          {/* Cookie Balance */}
          <div className="flex items-center gap-3 mb-4 bg-background/50 backdrop-blur-sm rounded-full px-6 py-3">
            <span className="text-2xl">🥠</span>
            <span className="text-2xl lg:text-3xl font-bold text-foreground">{cookieBalance.toLocaleString()}</span>
            <span className="text-base text-muted-foreground">cookies</span>
          </div>

          {/* AD VERY Harvest */}
          <div className="mb-6">
            <p className="text-base font-semibold text-foreground mb-2">AD VERY Harvest</p>
            <div className="flex items-center gap-3 bg-background/50 backdrop-blur-sm rounded-full px-6 py-3">
              <img src={logo} alt="VERY" className="w-6 h-6 object-contain flex-shrink-0" />
              <span className="text-2xl lg:text-3xl font-bold text-foreground">{veryAmount}</span>
              <span className="text-base text-muted-foreground">VERY</span>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => navigate('/mining')}
            className="w-full lg:w-auto flex items-center justify-center gap-3 px-12 py-5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-sm transition-all duration-200 transform hover:scale-105"
          >
            <span>Go to Harvest <span className="text-pink-400">VERY</span></span>
            <img src={logo} alt="VERY" className="w-5 h-5 object-contain flex-shrink-0" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 -mt-20 relative z-20">
        {/* Today's Mission */}
        <section className="bg-card/80 backdrop-blur-xl rounded-3xl p-5 lg:p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Today's Mission</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop"
                    alt="Steps"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Count 1,000 steps</h3>
                  <div className="px-2 py-0.5 bg-blue-500/20 text-blue-600 text-xs rounded-full font-medium">
                    🔐 DeCap
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Up to 50,000 credits daily - Bot protection enabled</p>
              </div>
              {wallet ? (
                <DeCap
                  mode="simple"
                  userWallet={wallet}
                  onSuccess={handleClaimSuccess}
                  onFailure={handleClaimFailure}
                  theme="auto"
                >
                  <button
                    className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 gradient-purple text-primary-foreground hover:opacity-90 disabled:opacity-50"
                    disabled={isClaimingReward || isConnectingWallet}
                  >
                    {isConnectingWallet ? "Connecting..." : isClaimingReward ? "Claiming..." : "Earn 50,000"}
                  </button>
                </DeCap>
              ) : (
                <button
                  className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 bg-gray-400 text-white opacity-50 cursor-not-allowed"
                  disabled
                >
                  {isConnectingWallet ? "Connecting Wallet..." : "Wallet Required"}
                </button>
              )}
            </div>
            <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-cyan/30 flex items-center justify-center border-4 border-primary/20">
                  <div className="text-center">
                    <span className="text-lg font-bold text-cyan">540C</span>
                    <p className="text-[10px] text-muted-foreground">30 days</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground">Attendance Check</h3>
                  <div className="px-2 py-0.5 bg-blue-500/20 text-blue-600 text-xs rounded-full font-medium">
                    🔐 DeCap
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Guaranteed reward just for attendance</p>
              </div>
              <DeCap
                mode="simple"
                userWallet={undefined}
                onSuccess={handleLuckyCookieSuccess}
                onFailure={handleLuckyCookieFailure}
                theme="auto"
              >
                <button className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 gradient-purple text-primary-foreground hover:opacity-90 disabled:opacity-50">
                  Lucky Cookie
                </button>
              </DeCap>
            </div>
          </div>
        </section>

        {/* Credit Market */}
        <section className="mb-6">
          <h2 className="text-xl font-bold text-foreground mb-2">Credit Market</h2>
          <p className="text-muted-foreground mb-4">Use your credits to try the Lucky Draw!</p>
          
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <ProductCard
              image="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/ipad-pro-13-select-wifi-spacegray-202210?wid=400&hei=400&fmt=png-alpha"
              brand="Apple"
              name="iPad Pro"
              status="coming-soon"
            />
            <ProductCard
              image="https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/MME73?wid=400&hei=400&fmt=png-alpha"
              brand="Apple"
              name="AirPods"
              status="coming-soon"
            />
          </div>
        </section>

        {/* Buy with Credits Section */}
        <section className="mb-8">
          <p className="text-muted-foreground mb-4">You can buy it with the credits you saved!</p>
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <ProductCard
              image="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&auto=format&fit=crop"
              brand="Very Network"
              name="VERY Node NFT"
              status="coming-soon"
            />
            <ProductCard
              image="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/512px-Google_Play_Store_badge_EN.svg.png"
              brand="Google Play Store"
              name="5,000 won gift card"
              status="coming-soon"
            />
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Index;
