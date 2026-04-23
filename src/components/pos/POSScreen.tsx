import { useState, useMemo } from "react";
import { useStore } from "@/store/useStore";
import { SaleRecord } from "@/data/products";
import SearchBar from "@/components/pos/SearchBar";
import CategoryBar from "@/components/pos/CategoryBar";
import ProductCard from "@/components/pos/ProductCard";
import CartPanel from "@/components/pos/CartPanel";
import ReceiptModal from "@/components/pos/ReceiptModal";
import AlertsPanel from "@/components/pos/AlertsPanel";
import LangToggle from "@/components/LangToggle";
import { useI18n } from "@/lib/i18n";
import { Clock, Store, BarChart3, Package, Truck, Users, FileText, Wallet, Bell, Tag } from "lucide-react";

const POSScreen = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [receiptSale, setReceiptSale] = useState<SaleRecord | null>(null);
  const [showAlerts, setShowAlerts] = useState(false);
  const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, cartTotal, cartItemCount, completeSale, customers, priceMode, setPriceMode, alerts, generateAlerts } = useStore();
  const { t, dir, locale, pn } = useI18n();

  const total = cartTotal();
  const itemCount = cartItemCount();

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory = activeCategory === "all" || p.category === activeCategory;
      const localized = pn(p.id, p.name);
      const matchesSearch = search === "" || localized.toLowerCase().includes(search.toLowerCase()) || p.name.includes(search) || p.barcode?.includes(search);
      return matchesCategory && matchesSearch;
    });
  }, [search, activeCategory, products, pn]);

  const handleCompleteSale = (method: "cash" | "card" | "credit", customerId?: string) => {
    const sale = completeSale(method, customerId);
    if (sale) setReceiptSale(sale);
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" });

  const navItems = [
    { id: "dashboard", label: t("dashboard"), icon: <BarChart3 className="w-4 h-4" /> },
    { id: "inventory", label: t("inventory"), icon: <Package className="w-4 h-4" /> },
    { id: "suppliers", label: t("suppliers"), icon: <Truck className="w-4 h-4" /> },
    { id: "customers", label: t("customers"), icon: <Users className="w-4 h-4" /> },
    { id: "reports", label: t("reports"), icon: <FileText className="w-4 h-4" /> },
    { id: "cashbox", label: t("cashbox"), icon: <Wallet className="w-4 h-4" /> },
    { id: "coupons", label: t("coupons"), icon: <Tag className="w-4 h-4" /> },
  ];

  const cartSidePos = dir === "rtl" ? "border-r" : "border-l";

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-4 py-2 bg-card border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-base font-display">{t("storeName")}</h1>
            <p className="text-[10px] text-muted-foreground">{t("posSystem")}</p>
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
              <span className={`absolute -top-1 ${dir === "rtl" ? "-right-1" : "-left-1"} w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold`}>
                {alerts.filter((a) => !a.dismissed).length}
              </span>
            )}
          </button>
          <LangToggle />
          <div className={`flex items-center gap-1.5 text-muted-foreground ${dir === "rtl" ? "mr-1" : "ml-1"}`}>
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">{timeStr}</span>
          </div>
        </div>
      </header>

      {/* Price Mode Toggle */}
      <div className="flex items-center gap-2 px-4 py-1.5 bg-card/50 border-b border-border">
        <span className="text-xs text-muted-foreground">{t("priceType")}:</span>
        <button onClick={() => setPriceMode("retail")} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${priceMode === "retail" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t("retail")}</button>
        <button onClick={() => setPriceMode("wholesale")} className={`px-3 py-1 rounded text-xs font-semibold transition-all ${priceMode === "wholesale" ? "bg-pos-info text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t("wholesale")}</button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex-1 flex flex-col p-4 gap-3 overflow-hidden">
          <SearchBar value={search} onChange={setSearch} />
          <CategoryBar activeCategory={activeCategory} onCategoryChange={setActiveCategory} />
          <div className="flex-1 overflow-y-auto pos-scrollbar">
            {filteredProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground"><p>{t("noProducts")}</p></div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} onAdd={addToCart} priceMode={priceMode} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`w-[380px] bg-card ${cartSidePos} border-border flex-shrink-0`}>
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
          <div className={`absolute top-2 ${dir === "rtl" ? "left-[400px]" : "right-[400px]"} w-96 z-40`}>
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
