import { Minus, Plus, Trash2 } from "lucide-react";
import { CartItem } from "@/data/products";
import { useI18n } from "@/lib/i18n";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}

const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
  const { pn, fmtMoney, dir } = useI18n();
  const price = item.priceType === "wholesale" ? item.wholesalePrice : item.price;
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 animate-slide-in">
      <img
        src={item.image}
        alt={pn(item.id, item.name)}
        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
      />
      <div className="flex-1 min-w-0 text-start">
        <p className="text-sm font-semibold text-foreground truncate">{pn(item.id, item.name)}</p>
        <p className="text-xs text-muted-foreground">{fmtMoney(price)}</p>
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
      <p className={`text-sm font-bold text-primary w-20 flex-shrink-0 ${dir === "rtl" ? "text-left" : "text-right"}`}>
        {fmtMoney(price * item.quantity)}
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
