import { Product } from "@/data/products";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
  priceMode?: "retail" | "wholesale";
}

const ProductCard = ({ product, onAdd, priceMode = "retail" }: ProductCardProps) => {
  const { t, pn, fmtMoney } = useI18n();
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= product.minStock && product.stock > 0;
  const displayPrice = priceMode === "wholesale" ? product.wholesalePrice : product.price;

  const unitMap: Record<string, string> = {
    piece: t("unitPiece"),
    kg: t("unitKg"),
    carton: t("unitCarton"),
    pack: t("unitPack"),
  };

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={`group relative bg-card rounded-xl border overflow-hidden text-start transition-all duration-200 ${
        isOutOfStock
          ? "border-border opacity-60 cursor-not-allowed"
          : "border-border hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 cursor-pointer active:scale-[0.97]"
      }`}
    >
      <div className="relative aspect-square overflow-hidden">
        <img src={product.image} alt={pn(product.id, product.name)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">{t("outOfStock")}</span>
          </div>
        )}
        {isLowStock && !isOutOfStock && (
          <div className="absolute top-1.5 end-1.5 bg-destructive/90 text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
            <AlertTriangle className="w-3 h-3" />
            {product.stock}
          </div>
        )}
        {priceMode === "wholesale" && (
          <div className="absolute top-1.5 start-1.5 bg-pos-info/90 text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">{t("wholesale")}</div>
        )}
      </div>
      <div className="p-2.5">
        <p className="text-foreground font-semibold text-xs truncate">{pn(product.id, product.name)}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-primary font-bold text-sm">{fmtMoney(displayPrice)}</span>
          <span className="text-muted-foreground text-[10px]">{unitMap[product.unit] || product.unit}</span>
        </div>
        {product.barcode && (
          <p className="text-muted-foreground text-[10px] mt-0.5 font-mono">{product.barcode}</p>
        )}
      </div>
    </button>
  );
};

export default ProductCard;
