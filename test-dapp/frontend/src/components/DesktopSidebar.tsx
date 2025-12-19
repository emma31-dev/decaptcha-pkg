import { Home, MessageCircle, LayoutList, Pickaxe, Wallet, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const SidebarItem = ({ to, icon, label, badge }: SidebarItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group",
        isActive
          ? "bg-primary/20 text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )
    }
  >
    <div className="relative">
      {icon}
      {badge && badge > 0 && (
        <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1">
          {badge}
        </span>
      )}
    </div>
    <span className="font-medium">{label}</span>
  </NavLink>
);

export const DesktopSidebar = () => {
  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-card border-r border-border p-4 fixed left-0 top-0">
      <div className="flex items-center gap-3 px-4 py-4 mb-6">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src="/src/assets/logo.svg" alt="VERY" className="w-8 h-8 object-contain flex-shrink-0" />
        </div>
        <span className="text-xl font-bold text-foreground">VeryChat</span>
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        <SidebarItem to="/" icon={<Home className="w-5 h-5" />} label="Home" />
        <SidebarItem to="/chats" icon={<MessageCircle className="w-5 h-5" />} label="Chats" />
        <SidebarItem to="/channels" icon={<LayoutList className="w-5 h-5" />} label="Channels" badge={1} />
        <SidebarItem to="/mining" icon={<Pickaxe className="w-5 h-5" />} label="Mining" badge={7} />
        <SidebarItem to="/wallet" icon={<Wallet className="w-5 h-5" />} label="Wallet" />
      </nav>

      <div className="border-t border-border pt-4">
        <SidebarItem to="/settings" icon={<Settings className="w-5 h-5" />} label="Settings" />
      </div>
    </aside>
  );
};
