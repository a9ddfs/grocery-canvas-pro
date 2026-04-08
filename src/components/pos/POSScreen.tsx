import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { SaleRecord } from "@/data/products";
import SearchBar from "@/components/pos/SearchBar";
import CategoryBar from "@/components/pos/CategoryBar";
import ProductCard from "@/components/pos/ProductCard";
import CartPanel from "@/components/pos/CartPanel";
import ReceiptModal from "@/components/pos/ReceiptModal";
import AlertsPanel from "@/components/pos/AlertsPanel";
import { Clock, Store, BarChart3, Package, Truck, Users, FileText, Wallet, Bell } from "lucide-react";

const POSScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemCount, completeSale, customers, priceMode, setPriceMode, alerts, generateAlerts } = useStore();

  const total = cartTotal();
  const itemCount = cartItemCount();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const matchesSearch = search === "" || p.name.includes(search) || p.barcode?.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, products]);

  const handleCompleteSale = (method: "cash" | "card" | "credit", customerId?: string) => {
    const sale = completeSale(method, customerId);
    if (sale) setReceiptSale(sale);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const navItems = [
    { id: "dashboard", label: "لوحة التحكم", icon: <BarChart3 className="w-4 h-4" /> },
    { id: "inventory", label: "المخزون", icon: <Package className="w-4 h-4" /> },
    { id: "suppliers", label: "الموردين", icon: <Truck className="w-4 h-4" /> },
    { id: "customers", label: "العملاء", icon: <Users className="w-4 h-4" /> },
    { id: "reports", label: "التقارير", icon: <FileText className="w-4 h-4" /> },
    { id: "cashbox", label: "الصندوق", icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-base font-display">بقالة السعادة</h1>
            <p className="text-[10px] text-muted-foreground">نظام نقاط البيع</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {navItems.map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className="px-2.5 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-pos-surface-hover transition-all flex items-center gap-1">
              {item.icon}
              <span className="hidden lg:inline">{item.label}</span>
            </button>
          ))}
          <button onClick={() => { generateAlerts(); setShowAlerts(!showAlerts); }} className="px-2.5 py-1.5 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-pos-surface-hover transition-all relative">
            <Bell className="w-4 h-4" />
            {alerts.filter((a) => !a.dismissed).length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold">
                {alerts.filter((a) => !a.dismissed).length}
              </span>
            )}
          </button>
          <div className="flex items-center gap-1.5 text-muted-foreground mr-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{timeStr}</span>
          </div>
        </div>
      </header>

      {/* Price Mode Toggle */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-card/50 border-b border-border">
        <span className="text-xs text-muted-foreground">نوع السعر:</span>
        <button onClick={() => setPriceMode("retail")} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${priceMode === "retail" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>تجزئة</button>
        <button onClick={() => setPriceMode("wholesale")} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${priceMode === "wholesale" ? "bg-pos-info text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>جملة</button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <div className="flex-1 overflow-y-auto pos-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><p>لا توجد منتجات</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} priceMode={priceMode} />
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
            customers={customers}
          />
        </div>

        {/* Alerts Dropdown */}
        {showAlerts && (
          <div className="absolute top-2 left-[400px] w-96 z-40">
            <AlertsPanel onNavigate={(p) => { setShowAlerts(false); onNavigate(p); }} />
          </div>
        )}
      </div>

      {receiptSale && (
        <ReceiptModal sale={receiptSale} onClose={() => setReceiptSale(null)} />
      )}
    </div>
  );
};

export default POSScreen;
