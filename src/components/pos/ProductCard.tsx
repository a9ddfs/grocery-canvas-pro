import { Product, unitLabels } from "@/data/products";
import { AlertTriangle } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  priceMode?: "retail" | "wholesale";
}

const ProductCard = ({ product, onAdd, priceMode = "retail" }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const displayPrice = priceMode === "wholesale" ? product.wholesalePrice : product.price;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={`group relative bg-card rounded-xl border overflow-hidden text-right transition-all duration-200 ${
        isOutOfStock
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer active:scale-[0.97]"
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">نفذت الكمية</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-1.5 right-1.5 bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" />
            {product.stock}
          </div>
        )}
        {priceMode === "wholesale" && (
          <div className="absolute top-1.5 left-1.5 bg-pos-info/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">جملة</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-foreground font-semibold text-xs truncate">{product.name}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-primary font-bold text-sm">{displayPrice.toFixed(2)} ر.س</span>
          <span className="text-muted-foreground text-[10px]">{unitLabels[product.unit] || product.unit}</span>
        </div>
        {product.barcode && (
          <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">{product.barcode}</p>
        )}
      </div>
    </button>
  );
};

export default ProductCard;
