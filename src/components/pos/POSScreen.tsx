import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { SaleRecord } from "@/data/products";
import SearchBar from "@/components/pos/SearchBar";
import CategoryBar from "@/components/pos/CategoryBar";
import ProductCard from "@/components/pos/ProductCard";
import CartPanel from "@/components/pos/CartPanel";
import ReceiptModal from "@/components/pos/ReceiptModal";
import { Clock, Store, BarChart3, Package } from "lucide-react";

const POSScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemCount, completeSale } = useStore();

  const total = cartTotal();
  const itemCount = cartItemCount();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = search === "" || p.name.includes(search) || p.barcode?.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, products]);

  const handleCompleteSale = (method: "cash" | "card") => {
    const sale = completeSale(method);
    if (sale) setReceiptSale(sale);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg font-display">بقالة السعادة</h1>
            <p className="text-xs text-muted-foreground">نظام نقاط البيع</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4" />
            لوحة التحكم
          </button>
          <button onClick={() => onNavigate("inventory")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all flex items-center gap-1.5">
            <Package className="w-4 h-4" />
            المخزون
          </button>
          <div className="flex items-center gap-2 text-muted-foreground mr-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{timeStr}</span>
            <span className="text-xs opacity-50">|</span>
            <span className="text-sm">{dateStr}</span>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex flex-col p-4 gap-4 overflow-hidden">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <div className="flex-1 overflow-y-auto pos-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <p>لا توجد منتجات</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-[380px] bg-card border-r border-border flex-shrink-0">
          <CartPanel
            items={cart}
            total={total}
            itemCount={itemCount}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onClear={clearCart}
            onCompleteSale={handleCompleteSale}
          />
        </div>
      </div>

      {receiptSale && (
        <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
      )}
    </div>
  );
};

export default POSScreen;
