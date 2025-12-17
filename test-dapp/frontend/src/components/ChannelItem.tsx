import { Flame } from "lucide-react";

interface ChannelItemProps {
  avatar: string;
  name: string;
  memberCount: number;
  lastMessage: string;
  time: string;
  unreadCount?: number;
  onClick?: () => void;
}

export const ChannelItem = ({
  avatar,
  name,
  memberCount,
  lastMessage,
  time,
  unreadCount,
  onClick,
}: ChannelItemProps) => {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 cursor-pointer transition-colors"
    >
      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-secondary">
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-coral flex-shrink-0" />
          <span className="font-semibold text-foreground truncate">{name}</span>
          <span className="text-sm text-primary font-medium">{memberCount.toLocaleString()}</span>
        </div>
        <p className="text-sm text-muted-foreground truncate">{lastMessage}</p>
      </div>
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span className="text-xs text-muted-foreground">{time}</span>
        {unreadCount && unreadCount > 0 && (
          <span className="min-w-[22px] h-[22px] flex items-center justify-center text-xs font-semibold bg-coral text-accent-foreground rounded-full px-1.5">
            {unreadCount}
          </span>
        )}
      </div>
    </div>
  );
};
