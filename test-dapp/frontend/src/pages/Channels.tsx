import { Search, Plus } from "lucide-react";
import { Layout } from "@/components/Layout";
import { ChannelItem } from "@/components/ChannelItem";

const channels = [
  {
    id: 1,
    avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&auto=format&fit=crop",
    name: "VERYCHAT AFRICA",
    memberCount: 2579,
    lastMessage: "PYTRO NETWORK !!",
    time: "AM 06:47",
    unreadCount: 1,
  },
];

const recommendedChannels = [
  {
    id: 2,
    avatar: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=200&auto=format&fit=crop",
    name: "GLOBAL CRYPTO",
    memberCount: 4274,
    lastMessage: "🔥 VeryChat Miners – Don't Miss DOUBLE Opport...",
    time: "AM 09:30",
  },
  {
    id: 3,
    avatar: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=200&auto=format&fit=crop",
    name: "GHANA CRYPTO HU...",
    memberCount: 344,
    lastMessage: "JAMES TOWN 🇬🇭⭐",
    time: "AM 01:05",
  },
  {
    id: 4,
    avatar: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=200&auto=format&fit=crop",
    name: "VERYCHAT AFRICA",
    memberCount: 2579,
    lastMessage: "PYTRO NETWORK !!",
    time: "AM 06:47",
  },
  {
    id: 5,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop",
    name: "Ms. Yeng - Crypto & ...",
    memberCount: 1194,
    lastMessage: "Goodmorning!",
    time: "AM 12:01",
  },
  {
    id: 6,
    avatar: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&auto=format&fit=crop",
    name: "Free Mining Info.",
    memberCount: 1601,
    lastMessage: "Good afternoon VERY NETWORK COMMUNITY 🤍",
    time: "AM 11:19",
  },
  {
    id: 7,
    avatar: "https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=200&auto=format&fit=crop",
    name: "Dunia Blockchain Ind...",
    memberCount: 1020,
    lastMessage: 'The Story of a Solana (SOL) "Diamond Hands" Inv...',
    time: "PM 11:51",
  },
];

const Channels = () => {
  return (
    <Layout>
      <div className="p-4 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Channels</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Search className="w-6 h-6 text-foreground" />
            </button>
            <button className="p-2 hover:bg-secondary rounded-full transition-colors">
              <Plus className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>

        {/* My Channels */}
        <section className="mb-6">
          {channels.map((channel) => (
            <ChannelItem key={channel.id} {...channel} />
          ))}
        </section>

        {/* Recommended Channels */}
        <section className="mb-24 lg:mb-6">
          <p className="text-primary font-medium mb-3">
            Recommend Channels <span className="text-primary">{recommendedChannels.length}</span>
          </p>
          <div className="space-y-1">
            {recommendedChannels.map((channel) => (
              <ChannelItem key={channel.id} {...channel} />
            ))}
          </div>
        </section>

        {/* Create Channel CTA */}
        <div className="fixed bottom-20 left-4 right-4 lg:bottom-6 lg:left-auto lg:right-6 lg:w-80 z-40 lg:ml-64">
          <button className="w-full py-4 rounded-full gradient-coral text-accent-foreground font-semibold text-lg shadow-lg hover:opacity-90 transition-opacity">
            Create a channel, earn more rewards
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Channels;
