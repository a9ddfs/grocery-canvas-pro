import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/data/products";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 animate-slide-in">
      <img
        src={item.image}
        alt={item.name}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0 text-right">
        <p className="text-sm font-semibold text-foreground truncate">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.price.toFixed(2)} ر.س</p>
      </div>
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-bold text-foreground">{item.quantity}</span>
        <button
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          className="w-7 h-7 rounded-md bg-secondary flex items-center justify-center hover:bg-pos-success hover:text-primary-foreground transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <p className="text-sm font-bold text-primary w-16 text-left flex-shrink-0">
        {(item.price * item.quantity).toFixed(2)}
      </p>
      <button
        onClick={() => onRemove(item.id)}
        className="p-1.5 rounded-md hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItemRow;
