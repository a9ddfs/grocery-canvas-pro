import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import { Truck, Plus, Phone, MapPin, Edit2, Trash2, X, ShoppingCart, Package } from "lucide-react";

const SuppliersPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchases, addPurchase, products } = useStore();
  const { t, dir, locale, pn, fmt, fmtMoney } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [showPurchase, setShowPurchase] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [purchaseForm, setPurchaseForm] = useState({ supplierId: "", items: [{ productId: "", quantity: 1, costPrice: 0 }], notes: "" });

  const handleAdd = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateSupplier(editingId, form);
      setEditingId(null);
    } else {
      addSupplier(form);
    }
    setForm({ name: "", phone: "", address: "", notes: "" });
    setShowAdd(false);
  };

  const handleEdit = (sup: typeof suppliers[0]) => {
    setForm({ name: sup.name, phone: sup.phone, address: sup.address, notes: sup.notes });
    setEditingId(sup.id);
    setShowAdd(true);
  };

  const addPurchaseItem = () => {
    setPurchaseForm((f) => ({ ...f, items: [...f.items, { productId: "", quantity: 1, costPrice: 0 }] }));
  };

  const updatePurchaseItem = (index: number, field: string, value: string | number) => {
    setPurchaseForm((f) => ({
      ...f,
      items: f.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const removePurchaseItem = (index: number) => {
    setPurchaseForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== index) }));
  };

  const handlePurchase = () => {
    if (!purchaseForm.supplierId || purchaseForm.items.some((i) => !i.productId)) return;
    const total = purchaseForm.items.reduce((sum, i) => sum + i.costPrice * i.quantity, 0);
    addPurchase({
      supplierId: purchaseForm.supplierId,
      items: purchaseForm.items.map((i) => ({
        ...i,
        productName: products.find((p) => p.id === i.productId)?.name || "",
      })),
      total,
      date: new Date(),
      notes: purchaseForm.notes,
    });
    setPurchaseForm({ supplierId: "", items: [{ productId: "", quantity: 1, costPrice: 0 }], notes: "" });
    setShowPurchase(false);
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          {t("suppliersTitle")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowPurchase(true)} className="px-3 py-2 bg-pos-success text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            {t("purchaseOp")}
          </button>
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: "", phone: "", address: "", notes: "" }); }} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            {t("addSupplier")}
          </button>
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("dashboard")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div key={sup.id} className="bg-card rounded-xl border border-border p-4 space-y-3">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-foreground">{sup.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(sup)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteSupplier(sup.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-muted-foreground">
                <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" />{sup.phone}</div>
                <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5" />{sup.address}</div>
              </div>
              {sup.notes && <p className="text-xs text-muted-foreground bg-secondary/50 rounded-lg p-2">{sup.notes}</p>}
              <div className="text-xs text-muted-foreground">
                {t("purchasesCount")}: {purchases.filter((p) => p.supplierId === sup.id).length} {t("operationCount")} | {t("totalLabel")}: {fmtMoney(purchases.filter((p) => p.supplierId === sup.id).reduce((s, p) => s + p.total, 0))}
              </div>
            </div>
          ))}
        </div>

        {purchases.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              {t("recentPurchases")}
            </h3>
            <div className="space-y-2">
              {purchases.slice(0, 10).map((po) => (
                <div key={po.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground font-semibold">{suppliers.find((s) => s.id === po.supplierId)?.name}</span>
                    <span className="text-muted-foreground">{po.items.length} {t("pieces")}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-xs">{new Date(po.date).toLocaleDateString(locale)}</span>
                    <span className="font-bold text-destructive">{fmtMoney(po.total)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); setEditingId(null); }} dir={dir}>
          <h2 className="font-bold text-foreground text-lg mb-4">{editingId ? t("editSupplier") : t("newSupplier")}</h2>
          <div className="space-y-3">
            <input placeholder={t("supplierName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <input placeholder={t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <input placeholder={t("address")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" rows={2} />
            <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
              {editingId ? t("saveChanges") : t("addSupplier")}
            </button>
          </div>
        </Modal>
      )}

      {showPurchase && (
        <Modal onClose={() => setShowPurchase(false)} dir={dir}>
          <h2 className="font-bold text-foreground text-lg mb-4">{t("recordPurchase")}</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pos-scrollbar">
            <select value={purchaseForm.supplierId} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
              <option value="">{t("selectSupplier")}</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {purchaseForm.items.map((item, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">{t("product")} {idx + 1}</span>
                  {purchaseForm.items.length > 1 && (
                    <button onClick={() => removePurchaseItem(idx)} className="text-destructive text-xs">{t("delete")}</button>
                  )}
                </div>
                <select value={item.productId} onChange={(e) => updatePurchaseItem(idx, "productId", e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm">
                  <option value="">{t("selectProduct")}</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{pn(p.id, p.name)}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">{t("qty")}</label>
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updatePurchaseItem(idx, "quantity", parseInt(e.target.value) || 1)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">{t("purchasePrice")}</label>
                    <input type="number" min={0} step={0.5} value={item.costPrice} onChange={(e) => updatePurchaseItem(idx, "costPrice", parseFloat(e.target.value) || 0)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addPurchaseItem} className="w-full py-2 border border-dashed border-border rounded-lg text-muted-foreground text-sm hover:text-primary hover:border-primary transition-colors">
              {t("addItem")}
            </button>
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>{t("totalLabel")}</span>
              <span className="text-primary">{fmtMoney(purchaseForm.items.reduce((s, i) => s + i.costPrice * i.quantity, 0))}</span>
            </div>
            <button onClick={handlePurchase} className="w-full bg-pos-success text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
              {t("confirmPurchase")}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose, dir }: { children: React.ReactNode; onClose: () => void; dir: "rtl" | "ltr" }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-card rounded-2xl border border-border w-full max-w-lg p-5 animate-pop-in relative" dir={dir} onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className={`absolute top-4 ${dir === "rtl" ? "left-4" : "right-4"} p-1.5 rounded-md hover:bg-secondary text-muted-foreground`}>
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);

export default SuppliersPage;
