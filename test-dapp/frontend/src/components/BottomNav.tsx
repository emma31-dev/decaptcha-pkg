import { Home, MessageCircle, LayoutList, Pickaxe, Wallet } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const NavItem = ({ to, icon, label, badge }: NavItemProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors relative",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
      )
    }
  >
    {({ isActive }) => (
      <>
        <div className="relative">
          {icon}
          {badge && badge > 0 && (
            <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-semibold bg-primary text-primary-foreground rounded-full px-1">
              {badge}
            </span>
          )}
        </div>
        <span className={cn("font-medium", isActive && "text-foreground")}>{label}</span>
      </>
    )}
  </NavLink>
);

export const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-border z-50 lg:hidden">
      <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
        <NavItem to="/" icon={<Home className="w-6 h-6" />} label="Home" />
        <NavItem to="/chats" icon={<MessageCircle className="w-6 h-6" />} label="Chats" />
        <NavItem to="/channels" icon={<LayoutList className="w-6 h-6" />} label="Channels" badge={1} />
        <NavItem to="/mining" icon={<Pickaxe className="w-6 h-6" />} label="Mining" badge={7} />
        <NavItem to="/wallet" icon={<Wallet className="w-6 h-6" />} label="Wallet" />
      </div>
    </nav>
  );
};
