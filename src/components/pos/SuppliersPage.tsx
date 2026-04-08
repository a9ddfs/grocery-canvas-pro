import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Truck, Plus, Phone, MapPin, Edit2, Trash2, X, Check, ShoppingCart, Package } from "lucide-react";

const SuppliersPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { suppliers, addSupplier, updateSupplier, deleteSupplier, purchases, addPurchase, products } = useStore();
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
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Truck className="w-6 h-6 text-primary" />
          إدارة الموردين والمشتريات
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowPurchase(true)} className="px-3 py-2 bg-pos-success text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4" />
            عملية شراء
          </button>
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: "", phone: "", address: "", notes: "" }); }} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إضافة مورد
          </button>
          <NavButtons onNavigate={onNavigate} />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-4">
        {/* Suppliers Grid */}
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
                المشتريات: {purchases.filter((p) => p.supplierId === sup.id).length} عملية |
                الإجمالي: {purchases.filter((p) => p.supplierId === sup.id).reduce((s, p) => s + p.total, 0).toFixed(2)} ر.س
              </div>
            </div>
          ))}
        </div>

        {/* Recent Purchases */}
        {purchases.length > 0 && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-primary" />
              آخر عمليات الشراء
            </h3>
            <div className="space-y-2">
              {purchases.slice(0, 10).map((po) => (
                <div key={po.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="text-foreground font-semibold">{suppliers.find((s) => s.id === po.supplierId)?.name}</span>
                    <span className="text-muted-foreground">{po.items.length} منتج</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground text-xs">{new Date(po.date).toLocaleDateString("ar-SA")}</span>
                    <span className="font-bold text-destructive">{po.total.toFixed(2)} ر.س</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Supplier Modal */}
      {showAdd && (
        <Modal onClose={() => { setShowAdd(false); setEditingId(null); }}>
          <h2 className="font-bold text-foreground text-lg mb-4">{editingId ? "تعديل المورد" : "إضافة مورد جديد"}</h2>
          <div className="space-y-3">
            <input placeholder="اسم المورد" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <input placeholder="رقم الهاتف" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <input placeholder="العنوان" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
            <textarea placeholder="ملاحظات" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" rows={2} />
            <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
              {editingId ? "حفظ التعديلات" : "إضافة المورد"}
            </button>
          </div>
        </Modal>
      )}

      {/* Purchase Modal */}
      {showPurchase && (
        <Modal onClose={() => setShowPurchase(false)}>
          <h2 className="font-bold text-foreground text-lg mb-4">تسجيل عملية شراء</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pos-scrollbar">
            <select value={purchaseForm.supplierId} onChange={(e) => setPurchaseForm({ ...purchaseForm, supplierId: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
              <option value="">اختر المورد</option>
              {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            {purchaseForm.items.map((item, idx) => (
              <div key={idx} className="bg-secondary/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">منتج {idx + 1}</span>
                  {purchaseForm.items.length > 1 && (
                    <button onClick={() => removePurchaseItem(idx)} className="text-destructive text-xs">حذف</button>
                  )}
                </div>
                <select value={item.productId} onChange={(e) => updatePurchaseItem(idx, "productId", e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm">
                  <option value="">اختر المنتج</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground">الكمية</label>
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updatePurchaseItem(idx, "quantity", parseInt(e.target.value) || 1)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">سعر الشراء</label>
                    <input type="number" min={0} step={0.5} value={item.costPrice} onChange={(e) => updatePurchaseItem(idx, "costPrice", parseFloat(e.target.value) || 0)} className="w-full bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addPurchaseItem} className="w-full py-2 border border-dashed border-border rounded-lg text-muted-foreground text-sm hover:text-primary hover:border-primary transition-colors">
              + إضافة منتج آخر
            </button>
            <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
              <span>الإجمالي</span>
              <span className="text-primary">{purchaseForm.items.reduce((s, i) => s + i.costPrice * i.quantity, 0).toFixed(2)} ر.س</span>
            </div>
            <button onClick={handlePurchase} className="w-full bg-pos-success text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
              تأكيد الشراء
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
  <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div className="bg-card rounded-2xl border border-border w-full max-w-lg p-5 animate-pop-in" dir="rtl" onClick={(e) => e.stopPropagation()}>
      <button onClick={onClose} className="absolute top-4 left-4 p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
        <X className="w-5 h-5" />
      </button>
      {children}
    </div>
  </div>
);

const NavButtons = ({ onNavigate }: { onNavigate: (page: string) => void }) => (
  <div className="flex gap-2">
    <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">الكاشير</button>
    <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">لوحة التحكم</button>
  </div>
);

export default SuppliersPage;
