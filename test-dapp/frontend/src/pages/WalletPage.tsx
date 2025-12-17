import { Wallet, ArrowUpRight, ArrowDownLeft, Coins } from "lucide-react";
import { Layout } from "@/components/Layout";

const WalletPage = () => {
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
            <span className="text-4xl font-bold text-foreground">12.4</span>
            <span className="text-xl text-primary font-semibold">VRC</span>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 py-3 rounded-xl gradient-purple text-primary-foreground font-semibold flex items-center justify-center gap-2">
              <ArrowUpRight className="w-5 h-5" />
              Send
            </button>
            <button className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold flex items-center justify-center gap-2">
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
                <p className="font-semibold text-foreground">12.4</p>
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
    </Layout>
  );
};

export default WalletPage;
