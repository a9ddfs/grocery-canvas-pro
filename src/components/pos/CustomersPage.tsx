import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import { Users, Plus, Phone, MapPin, Edit2, Trash2, DollarSign, Calendar, CheckCircle2 } from "lucide-react";

const CustomersPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { customers, addCustomer, updateCustomer, deleteCustomer, debts, addDebtPayment, sales } = useStore();
  const { t, dir, locale, fmtMoney, fmt } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", notes: "" });
  const [payDebtId, setPayDebtId] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    if (editingId) {
      updateCustomer(editingId, form);
      setEditingId(null);
    } else {
      addCustomer(form);
    }
    setForm({ name: "", phone: "", address: "", notes: "" });
    setShowAdd(false);
  };

  const handleEdit = (cust: typeof customers[0]) => {
    setForm({ name: cust.name, phone: cust.phone, address: cust.address, notes: cust.notes });
    setEditingId(cust.id);
    setShowAdd(true);
  };

  const handlePayDebt = () => {
    if (!payDebtId || !payAmount) return;
    addDebtPayment(payDebtId, { amount: parseFloat(payAmount), date: new Date(), notes: "" });
    setPayDebtId(null);
    setPayAmount("");
  };

  const getCustomerDebts = (customerId: string) => debts.filter((d) => d.customerId === customerId);
  const getCustomerTotalDebt = (customerId: string) => {
    return getCustomerDebts(customerId).reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  };
  const getCustomerPurchases = (customerId: string) => sales.filter((s) => s.customerId === customerId);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          {t("customersTitle")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => { setShowAdd(true); setEditingId(null); setForm({ name: "", phone: "", address: "", notes: "" }); }} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            {t("addCustomer")}
          </button>
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("dashboard")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-3">
            <h3 className="font-bold text-foreground text-sm">{t("customers_count")} ({customers.length})</h3>
            {customers.map((cust) => {
              const totalDebt = getCustomerTotalDebt(cust.id);
              return (
                <div
                  key={cust.id}
                  onClick={() => setSelectedCustomer(cust.id)}
                  className={`bg-card rounded-xl border p-4 cursor-pointer transition-all ${selectedCustomer === cust.id ? "border-primary" : "border-border hover:border-primary/30"}`}
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-foreground">{cust.name}</h4>
                    <div className="flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); handleEdit(cust); }} className="p-1 rounded text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={(e) => { e.stopPropagation(); deleteCustomer(cust.id); }} className="p-1 rounded text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5"><Phone className="w-3 h-3" />{cust.phone}</div>
                    <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3" />{cust.address}</div>
                  </div>
                  {totalDebt > 0 && (
                    <div className="mt-2 px-2 py-1 bg-destructive/15 rounded text-destructive text-xs font-semibold">
                      {t("debtsLbl")}: {fmtMoney(totalDebt)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-2 space-y-4">
            {selectedCustomer ? (
              <>
                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-destructive" />
                    {t("debts")}
                  </h3>
                  {getCustomerDebts(selectedCustomer).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">{t("noDebts")}</p>
                  ) : (
                    <div className="space-y-3">
                      {getCustomerDebts(selectedCustomer).map((debt) => (
                        <div key={debt.id} className="bg-secondary/50 rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                debt.status === "paid" ? "bg-pos-success/20 text-pos-success" :
                                debt.status === "partial" ? "bg-primary/20 text-primary" :
                                "bg-destructive/20 text-destructive"
                              }`}>
                                {debt.status === "paid" ? t("paid") : debt.status === "partial" ? t("partial") : t("pending")}
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {t("dueDate")}: {new Date(debt.dueDate).toLocaleDateString(locale)}
                              </span>
                            </div>
                            <span className="font-bold text-foreground">{fmtMoney(debt.amount)}</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">{t("paidLbl")}: {fmt(debt.paidAmount)} | {t("remaining")}: {fmt(debt.amount - debt.paidAmount)}</span>
                            {debt.status !== "paid" && (
                              <button onClick={() => { setPayDebtId(debt.id); setPayAmount(String(debt.amount - debt.paidAmount)); }} className="px-2 py-1 bg-pos-success/15 text-pos-success rounded text-xs font-semibold hover:bg-pos-success/25 transition-colors flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                {t("payDebt")}
                              </button>
                            )}
                          </div>
                          {debt.payments.length > 0 && (
                            <div className="mt-2 pt-2 border-t border-border space-y-1">
                              {debt.payments.map((p) => (
                                <div key={p.id} className="flex justify-between text-xs text-muted-foreground">
                                  <span>{t("payment")}: {fmtMoney(p.amount)}</span>
                                  <span>{new Date(p.date).toLocaleDateString(locale)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-xl border border-border p-5">
                  <h3 className="font-bold text-foreground mb-4">{t("purchaseHistory")}</h3>
                  {getCustomerPurchases(selectedCustomer).length === 0 ? (
                    <p className="text-muted-foreground text-sm text-center py-4">{t("noPurchases")}</p>
                  ) : (
                    <div className="space-y-2">
                      {getCustomerPurchases(selectedCustomer).slice(0, 10).map((sale) => (
                        <div key={sale.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 text-sm">
                          <span className="text-muted-foreground">{sale.items.length} {t("pieces")}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{new Date(sale.date).toLocaleDateString(locale)}</span>
                            <span className="font-bold text-primary">{fmtMoney(sale.grandTotal)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("selectCustomerView")}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => { setShowAdd(false); setEditingId(null); }}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir={dir} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">{editingId ? t("editCustomer") : t("newCustomer")}</h2>
            <div className="space-y-3">
              <input placeholder={t("customerName")} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input placeholder={t("phone")} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input placeholder={t("address")} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <textarea placeholder={t("notes")} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" rows={2} />
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
                {editingId ? t("save") : t("add")}
              </button>
            </div>
          </div>
        </div>
      )}

      {payDebtId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPayDebtId(null)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-5 animate-pop-in" dir={dir} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">{t("payDebtTitle")}</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">{t("amount")}</label>
                <input type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm mt-1" />
              </div>
              <button onClick={handlePayDebt} className="w-full bg-pos-success text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">
                {t("confirmPay")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;
