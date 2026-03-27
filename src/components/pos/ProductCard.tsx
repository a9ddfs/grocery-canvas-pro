import { Product } from "@/data/products";

interface ProductCardProps {
  product: Product;
  onAdd: (product: Product) => void;
}

const ProductCard = ({ product, onAdd }: ProductCardProps) => {
  return (
    <button
      onClick={() => onAdd(product)}
      className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 animate-pop-in text-right"
    >
      <div className="aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={512}
          height={512}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-card-foreground text-sm truncate">
          {product.name}
        </h3>
        <p className="text-primary font-bold text-lg mt-1">
          {product.price.toFixed(2)} <span className="text-xs text-muted-foreground">ر.س</span>
        </p>
      </div>
    </button>
  );
};

export default ProductCard;
