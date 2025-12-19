import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Chats from "./pages/Chats";
import Channels from "./pages/Channels";
import Mining from "./pages/Mining";
import WalletPage from "./pages/WalletPage";
import TestIndex from "./pages/TestIndex";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/home" element={<Index />} />
          <Route path="/chats" element={<Chats />} />
          <Route path="/channels" element={<Channels />} />
          <Route path="/mining" element={<Mining />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/test" element={<TestIndex />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
