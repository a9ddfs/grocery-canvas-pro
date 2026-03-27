import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  const isOutOfStock = product.stock <= 0;

  return (
    <button
      onClick={() => !isOutOfStock && onAdd(product)}
      disabled={isOutOfStock}
      className={`group bg-card rounded-xl overflow-hidden border border-border transition-all duration-200 text-right relative ${
        isOutOfStock
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10"
      } animate-pop-in`}
    >
      <div className="aspect-square overflow-hidden relative">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
            متبقي {product.stock}
          </span>
        )}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
            <span className="bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1 rounded">نفذت الكمية</span>
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-card-foreground text-sm truncate">{product.name}</h3>
        <p className="text-primary font-bold text-lg mt-1">
          {product.price.toFixed(2)} <span className="text-xs text-muted-foreground">ر.س</span>
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
