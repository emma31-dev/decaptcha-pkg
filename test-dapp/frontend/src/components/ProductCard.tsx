import { Coins } from "lucide-react";

interface ProductCardProps {
  image: string;
  brand: string;
  name: string;
  status: "coming-soon" | "available";
  onClick?: () => void;
}

export const ProductCard = ({ image, brand, name, status, onClick }: ProductCardProps) => {
  return (
    <div
      onClick={onClick}
      className="bg-card rounded-2xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.02]"
    >
      <div className="aspect-square bg-foreground/5 p-4 flex items-center justify-center">
        <img src={image} alt={name} className="w-full h-full object-contain" />
      </div>
      <div className="p-4">
        <p className="text-sm text-muted-foreground">{brand}</p>
        <h3 className="font-semibold text-foreground">{name}</h3>
        <button
          className={`mt-3 w-full py-2 rounded-full text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
            status === "coming-soon"
              ? "bg-primary/30 text-primary"
              : "gradient-purple text-primary-foreground"
          }`}
        >
          <Coins className="w-4 h-4" />
          {status === "coming-soon" ? "Coming Soon" : "Buy Now"}
        </button>
      </div>
    </div>
  );
};
