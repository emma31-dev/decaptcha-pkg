import { Settings, Coins } from "lucide-react";
import { Layout } from "@/components/Layout";
import { MissionCard } from "@/components/MissionCard";
import { ProductCard } from "@/components/ProductCard";
import { useState } from "react";
import { toast } from "sonner";

const IndexSimple = () => {
  const [coins, setCoins] = useState(0.0);

  const handleClaimClick = () => {
    setCoins(prev => prev + 50000);
    toast.success("🎉 Reward Claimed!", {
      description: "You've successfully earned 50,000 coins!",
      duration: 4000,
    });
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="relative h-40 lg:h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-background" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639762681057-408e52192e55?w=800&auto=format&fit=crop&q=60')] bg-cover bg-center opacity-30" />
        
        <div className="relative z-10 p-4 lg:p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full bg-gold flex items-center justify-center">
                <Coins className="w-3 h-3 text-background" />
              </div>
              <span className="font-semibold text-foreground">{coins.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 bg-background/50 backdrop-blur-sm rounded-full px-3 py-1.5">
              <div className="w-5 h-5 rounded-full gradient-purple flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">V</span>
              </div>
              <span className="font-semibold text-foreground">12.4</span>
            </div>
          </div>
          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <Settings className="w-6 h-6 text-foreground" />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 lg:px-6 -mt-8 relative z-20">
        {/* Today's Mission */}
        <section className="bg-card/80 backdrop-blur-xl rounded-3xl p-5 lg:p-6 mb-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Today's Mission</h2>
          <div className="space-y-4">
            <MissionCard
              image={
                <div className="w-16 h-16 rounded-xl overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&auto=format&fit=crop"
                    alt="Steps"
                    className="w-full h-full object-cover"
                  />
                </div>
              }
              title="Count 1,000 steps"
              description="Up to 50,000 credits daily - Ready for DeCap integration"
              buttonText="Earn 50,000"
              buttonVariant="primary"
              onClick={handleClaimClick}
            />
            <MissionCard
              image={
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/30 to-cyan/30 flex items-center justify-center border-4 border-primary/20">
                  <div className="text-center">
                    <span className="text-lg font-bold text-cyan">540C</span>
                    <p className="text-[10px] text-muted-foreground">30 days</p>
                  </div>
                </div>
              }
              title="Attendance Check"
              description="Guaranteed reward just for attendance"
              buttonText="Lucky Cookie"
              buttonVariant="secondary"
            />
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

export default IndexSimple;