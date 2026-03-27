import { useStore } from "@/store/useStore";
import { Package, AlertTriangle, Edit2, Check, X } from "lucide-react";
import { useState } from "react";

const InventoryPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { products, updateStock } = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [filter, setFilter] = useState<"all" | "low">("all");

  const displayed = filter === "low" ? products.filter((p) => p.stock <= 10) : products;

  const handleSave = (id: string) => {
    updateStock(id, parseInt(editValue) || 0);
    setEditingId(null);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Package className="w-6 h-6 text-primary" />
          إدارة المخزون
        </h1>
        <div className="flex gap-2">
          <button onClick={() => onNavigate("pos")} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">
            الكاشير
          </button>
          <button onClick={() => onNavigate("dashboard")} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">
            لوحة التحكم
          </button>
        </div>
      </header>

      <div className="p-6 space-y-4 flex-1 overflow-hidden flex flex-col">
        {/* Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              filter === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            جميع المنتجات ({products.length})
          </button>
          <button
            onClick={() => setFilter("low")}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              filter === "low" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            مخزون منخفض ({products.filter((p) => p.stock <= 10).length})
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto pos-scrollbar bg-card rounded-xl border border-border">
          <table className="w-full">
            <thead className="sticky top-0 bg-card z-10">
              <tr className="border-b border-border text-muted-foreground text-sm">
                <th className="text-right py-3 px-4">المنتج</th>
                <th className="text-right py-3 px-4">التصنيف</th>
                <th className="text-right py-3 px-4">السعر</th>
                <th className="text-right py-3 px-4">الكمية</th>
                <th className="text-right py-3 px-4">الحالة</th>
                <th className="text-center py-3 px-4">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt={product.name} className="w-10 h-10 rounded-lg object-cover" />
                      <span className="font-semibold text-foreground text-sm">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-muted-foreground text-sm">
                    {product.category === "fruits" ? "فواكه" :
                     product.category === "vegetables" ? "خضروات" :
                     product.category === "dairy" ? "ألبان" :
                     product.category === "bakery" ? "مخبوزات" :
                     product.category === "drinks" ? "مشروبات" : "معلبات"}
                  </td>
                  <td className="py-3 px-4 text-foreground text-sm font-semibold">{product.price.toFixed(2)} ر.س</td>
                  <td className="py-3 px-4">
                    {editingId === product.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="w-20 bg-secondary text-foreground px-2 py-1 rounded border border-primary text-sm text-center"
                        autoFocus
                      />
                    ) : (
                      <span className={`font-bold text-sm ${product.stock <= 10 ? "text-destructive" : product.stock <= 20 ? "text-primary" : "text-pos-success"}`}>
                        {product.stock}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {product.stock === 0 ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/20 text-destructive">نفذ</span>
                    ) : product.stock <= 10 ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-destructive/20 text-destructive flex items-center gap-1 w-fit">
                        <AlertTriangle className="w-3 h-3" /> منخفض
                      </span>
                    ) : product.stock <= 20 ? (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/20 text-primary">متوسط</span>
                    ) : (
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-pos-success/20 text-pos-success">متوفر</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {editingId === product.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleSave(product.id)} className="p-1.5 rounded-md bg-pos-success/20 text-pos-success hover:bg-pos-success/30 transition-colors">
                          <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md bg-destructive/20 text-destructive hover:bg-destructive/30 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingId(product.id); setEditValue(String(product.stock)); }}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InventoryPage;
