import { cn } from "@/lib/utils";

interface MissionCardProps {
  image: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "primary" | "secondary";
  onClick?: () => void;
}

export const MissionCard = ({
  image,
  title,
  description,
  buttonText,
  buttonVariant = "primary",
  onClick,
}: MissionCardProps) => {
  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-2xl">
      <div className="flex-shrink-0">{image}</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <button
        onClick={onClick}
        className={cn(
          "px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200",
          buttonVariant === "primary"
            ? "gradient-purple text-primary-foreground hover:opacity-90"
            : "bg-primary/30 text-primary hover:bg-primary/40"
        )}
      >
        {buttonText}
      </button>
    </div>
  );
};
