import { Search } from "lucide-react";
import { Layout } from "@/components/Layout";

const Chats = () => {
  return (
    <Layout>
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Chats</h1>
          <button className="p-2 hover:bg-secondary rounded-full transition-colors">
            <Search className="w-6 h-6 text-foreground" />
          </button>
        </div>
        
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4">
            <span className="text-3xl">💬</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">No chats yet</h2>
          <p className="text-muted-foreground">Start a conversation with someone!</p>
        </div>
      </div>
    </Layout>
  );
};

export default Chats;
