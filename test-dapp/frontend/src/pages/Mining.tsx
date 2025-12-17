import { UserPlus, Mail, Sparkles, CloudRain, Gift } from "lucide-react";
import { Layout } from "@/components/Layout";
import { useState, useEffect } from "react";

const Mining = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 42, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
        }
        if (minutes < 0) {
          minutes = 59;
          hours--;
        }
        if (hours < 0) {
          hours = 11;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (num: number) => num.toString().padStart(2, '0');

  return (
    <Layout>
      <div className="p-4 lg:p-6 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Mining</h1>
          <button className="p-2 hover:bg-secondary/50 rounded-full transition-colors">
            <UserPlus className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {/* User Info Banner */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-coral flex items-center justify-center text-white font-bold shrink-0">
            E
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="text-gold">Lv 1.</span>{" "}
              <span className="text-coral font-semibold">Emma.xyz || DEV</span>{" "}
              <span className="text-muted-foreground">invited</span>{" "}
              <span className="text-cyan font-semibold">0</span>{" "}
              <span className="text-muted-foreground">friends</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Current Mining Power: <span className="text-gold">1x</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Invite <span className="text-coral font-semibold">1</span> more friends for{" "}
              <span className="text-gold">3x</span> Mining Power!
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="w-12 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
              <Mail className="w-6 h-6 text-muted-foreground" />
            </div>
            <span className="px-3 py-1 rounded-full bg-coral text-white text-xs font-semibold">
              D-5 ×3
            </span>
          </div>
        </div>

        {/* First 10k Users Banner */}
        <div className="gradient-coral rounded-full px-4 py-3 mb-6 flex items-center gap-2">
          <span className="bg-background/20 backdrop-blur-sm text-coral-foreground px-3 py-1 rounded-full text-sm font-semibold">
            First 10k Users
          </span>
          <span className="text-white font-medium text-sm">
            <span className="text-gold font-bold">5</span> more invite to{" "}
            <span className="text-gold font-bold">1,000</span> VERY
          </span>
        </div>

        {/* VERY Balance */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">V</span>
            </div>
            <span className="text-3xl font-bold text-foreground">12.4</span>
            <span className="text-2xl text-muted-foreground">VERY</span>
          </div>
          <div className="bg-secondary/80 backdrop-blur-sm rounded-full px-4 py-2">
            <span className="text-muted-foreground text-sm">Boost applies from Level 3</span>
            <span className="text-coral ml-2">+</span>
          </div>
        </div>

        {/* Mining Area with Boosters */}
        <div className="relative flex items-center justify-center mb-6">
          {/* Mining Pot */}
          <div className="relative">
            {/* Pot rim */}
            <div className="w-44 h-36 relative">
              {/* Green glowing surface */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-36 h-28 rounded-[50%] bg-gradient-to-b from-lime-400/80 via-green-500/70 to-green-600/60 shadow-lg shadow-green-500/30">
                <div className="absolute inset-2 rounded-[50%] bg-gradient-to-br from-lime-300/60 to-green-400/40 animate-pulse" />
              </div>
              {/* Wooden barrel */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-20">
                <div className="absolute inset-0 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 rounded-b-[40%] rounded-t-lg">
                  {/* Barrel lines */}
                  <div className="absolute top-2 left-0 right-0 h-1 bg-amber-950/40" />
                  <div className="absolute top-6 left-0 right-0 h-1 bg-amber-950/40" />
                  <div className="absolute bottom-4 left-0 right-0 h-1 bg-amber-950/40" />
                </div>
              </div>
            </div>
          </div>

          {/* Booster Items - Right Side */}
          <div className="absolute right-0 top-0 flex flex-col gap-3">
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold z-10">
                2
              </div>
              <div className="w-16 h-16 bg-secondary/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan" />
                <span className="text-xs text-muted-foreground mt-1">booster</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold z-10">
                4
              </div>
              <div className="w-16 h-16 bg-secondary/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                <CloudRain className="w-6 h-6 text-pink-400" />
                <span className="text-xs text-muted-foreground mt-1">rain</span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute -top-2 -left-2 w-5 h-5 rounded-full bg-coral text-white text-xs flex items-center justify-center font-bold z-10">
                N
              </div>
              <div className="w-16 h-16 bg-secondary/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center">
                <Gift className="w-6 h-6 text-purple-400" />
                <span className="text-xs text-muted-foreground mt-1">Lucky box</span>
              </div>
            </div>
          </div>
        </div>

        {/* Harvest Timer */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            Harvest in{" "}
            <span className="text-coral">
              {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}
            </span>
          </h2>
          <p className="text-muted-foreground">
            Harvest <span className="text-cyan font-semibold">2.4</span> VERY every 12 hours!
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-secondary rounded-full overflow-hidden mb-8">
          <div className="absolute left-0 top-0 h-full bg-coral rounded-full" style={{ width: '15%' }} />
          <div className="absolute left-[15%] -top-1 -translate-x-1/2">
            <div className="w-5 h-5 rounded-full bg-coral border-2 border-background" />
          </div>
          <div className="absolute right-2 -top-2.5">
            <span className="text-lg">🍓</span>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Mining;
