import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import { Coupon } from "@/data/types";
import { Tag, Plus, Edit2, Trash2, X, Percent, DollarSign, Calendar, CheckCircle2, XCircle } from "lucide-react";
import LangToggle from "@/components/LangToggle";

const CouponsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useStore();
  const { t, dir, fmtMoney, locale } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const blank = { code: "", type: "percentage" as "percentage" | "fixed", value: 10, minPurchase: 0, maxUses: 0, expiryDate: "", active: true };
  const [form, setForm] = useState<typeof blank>(blank);

  const openNew = () => { setEditingId(null); setForm(blank); setShowAdd(true); };

  const openEdit = (c: Coupon) => {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minPurchase: c.minPurchase,
      maxUses: c.maxUses,
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split("T")[0] : "",
      active: c.active,
    });
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!form.code.trim() || form.value <= 0) return;
    const payload = {
      code: form.code,
      type: form.type,
      value: form.value,
      minPurchase: form.minPurchase || 0,
      maxUses: form.maxUses || 0,
      expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
      active: form.active,
    };
    if (editingId) updateCoupon(editingId, payload);
    else addCoupon(payload);
    setShowAdd(false);
    setEditingId(null);
    setForm(blank);
  };

  const couponStatus = (c: Coupon) => {
    if (!c.active) return { label: t("inactive"), color: "bg-muted text-muted-foreground" };
    if (c.expiryDate && new Date(c.expiryDate) < new Date()) return { label: t("expired"), color: "bg-destructive/20 text-destructive" };
    if (c.maxUses > 0 && c.usedCount >= c.maxUses) return { label: t("couponMaxedOut"), color: "bg-destructive/20 text-destructive" };
    return { label: t("active"), color: "bg-pos-success/20 text-pos-success" };
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Tag className="w-6 h-6 text-primary" />
          {t("couponsTitle")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={openNew} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            {t("addCoupon")}
          </button>
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("dashboard")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar">
        {coupons.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">{t("noCoupons")}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {coupons.map((c) => {
              const status = couponStatus(c);
              return (
                <div key={c.id} className="bg-card rounded-xl border border-border p-4 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mt-12 -mr-12" />
                  <div className="flex items-start justify-between relative">
                    <div>
                      <p className="text-xs text-muted-foreground">{t("couponCode")}</p>
                      <h3 className="font-bold text-foreground text-xl font-mono tracking-wider">{c.code}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-2xl font-bold text-primary">
                    {c.type === "percentage" ? (
                      <><Percent className="w-5 h-5" /><span>{c.value}%</span></>
                    ) : (
                      <><DollarSign className="w-5 h-5" /><span>{fmtMoney(c.value)}</span></>
                    )}
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {c.minPurchase > 0 && <div>{t("minPurchase")}: {fmtMoney(c.minPurchase)}</div>}
                    <div>{t("uses")}: {c.usedCount} / {c.maxUses === 0 ? t("unlimited") : c.maxUses}</div>
                    {c.expiryDate && (
                      <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />{new Date(c.expiryDate).toLocaleDateString(locale)}</div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${status.color}`}>{status.label}</span>
                    <button
                      onClick={() => updateCoupon(c.id, { active: !c.active })}
                      className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      title={c.active ? t("inactive") : t("active")}
                    >
                      {c.active ? <CheckCircle2 className="w-4 h-4 text-pos-success" /> : <XCircle className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir={dir} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-foreground text-lg">{editingId ? t("editCoupon") : t("newCoupon")}</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3">
              <input
                placeholder={t("couponCodeField")}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm font-mono uppercase tracking-wider"
              />
              <div>
                <label className="text-xs text-muted-foreground">{t("couponType")}</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button onClick={() => setForm({ ...form, type: "percentage" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${form.type === "percentage" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <Percent className="w-4 h-4" />{t("percentage")}
                  </button>
                  <button onClick={() => setForm({ ...form, type: "fixed" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${form.type === "fixed" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>
                    <DollarSign className="w-4 h-4" />{t("fixedAmount")}
                  </button>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("discountValue")} {form.type === "percentage" ? "(%)" : `(${t("currency")})`}</label>
                <input type="number" min={0} step={form.type === "percentage" ? 1 : 0.5} value={form.value} onChange={(e) => setForm({ ...form, value: parseFloat(e.target.value) || 0 })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("minPurchase")} ({t("currency")})</label>
                <input type="number" min={0} value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: parseFloat(e.target.value) || 0 })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("maxUses")}</label>
                <input type="number" min={0} value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: parseInt(e.target.value) || 0 })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">{t("expiryDate")}</label>
                <input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm mt-1" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">{t("active")}</span>
              </label>
              <button onClick={handleSave} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
                {editingId ? t("save") : t("add")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponsPage;
