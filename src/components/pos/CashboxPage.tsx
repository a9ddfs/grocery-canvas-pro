import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, Minus } from "lucide-react";

const CashboxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { cashbox, getCashboxBalance, addCashboxEntry, addExpense } = useStore();
  const { t, dir, locale, fmtMoney } = useI18n();
  const [showAdd, setShowAdd] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [form, setForm] = useState({ type: "deposit" as "deposit" | "withdrawal", amount: "", description: "" });
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: t("catOther") });

  const balance = getCashboxBalance();
  const totalIn = cashbox.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalOut = cashbox.filter((e) => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);

  const handleAdd = () => {
    const amount = parseFloat(form.amount);
    if (!amount || !form.description.trim()) return;
    addCashboxEntry({
      type: form.type,
      amount: form.type === "withdrawal" ? -amount : amount,
      description: form.description,
      date: new Date(),
    });
    setForm({ type: "deposit", amount: "", description: "" });
    setShowAdd(false);
  };

  const handleExpense = () => {
    const amount = parseFloat(expenseForm.amount);
    if (!amount || !expenseForm.description.trim()) return;
    addExpense({
      description: expenseForm.description,
      amount,
      category: expenseForm.category,
      date: new Date(),
    });
    setExpenseForm({ description: "", amount: "", category: t("catOther") });
    setShowExpense(false);
  };

  // Decode store-side description (format like "sale#abc|cash" or "purchase|SupplierName")
  const renderDescription = (entry: typeof cashbox[0]) => {
    const raw = entry.description;
    if (entry.type === "sale" && raw.startsWith("sale#")) {
      const [tag, method] = raw.split("|");
      const num = tag.slice(5);
      const m = method === "cash" ? t("cash") : method === "card" ? t("card") : t("credit");
      return `${t("saleType")} #${num} — ${m}`;
    }
    if (entry.type === "purchase" && raw.startsWith("purchase|")) {
      return `${t("bySupplier")} ${raw.slice(9)}`;
    }
    if (entry.type === "expense" && raw.startsWith("expense|")) {
      return `${t("expenseType")}: ${raw.slice(8)}`;
    }
    if (entry.type === "debt_payment" && raw.startsWith("debt_payment|")) {
      return `${t("debtPaymentType")} — ${raw.slice(13)}`;
    }
    return raw;
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    sale: { label: t("saleType"), color: "text-pos-success" },
    purchase: { label: t("purchaseType"), color: "text-destructive" },
    expense: { label: t("expenseType"), color: "text-destructive" },
    debt_payment: { label: t("debtPaymentType"), color: "text-pos-success" },
    deposit: { label: t("deposit"), color: "text-pos-info" },
    withdrawal: { label: t("withdrawal"), color: "text-primary" },
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          {t("cashboxTitle")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => setShowExpense(true)} className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Minus className="w-4 h-4" />
            {t("expense")}
          </button>
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            {t("depositWithdrawal")}
          </button>
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("dashboard")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3"><DollarSign className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">{t("cashboxBalance")}</p>
            <p className={`font-bold text-xl mt-0.5 ${balance >= 0 ? "text-pos-success" : "text-destructive"}`}>{fmtMoney(balance)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-pos-success/15 text-pos-success flex items-center justify-center mb-3"><ArrowUpCircle className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">{t("totalIn")}</p>
            <p className="text-pos-success font-bold text-xl mt-0.5">{fmtMoney(totalIn)}</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center mb-3"><ArrowDownCircle className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">{t("totalOut")}</p>
            <p className="text-destructive font-bold text-xl mt-0.5">{fmtMoney(totalOut)}</p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4">{t("transactionLog")}</h3>
          {cashbox.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">{t("noTransactions")}</p>
          ) : (
            <div className="space-y-2">
              {cashbox.map((entry) => {
                const info = typeLabels[entry.type] || { label: entry.type, color: "text-foreground" };
                return (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm">
                    <div className="flex items-center gap-3">
                      {entry.amount > 0 ? <ArrowUpCircle className="w-4 h-4 text-pos-success" /> : <ArrowDownCircle className="w-4 h-4 text-destructive" />}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${info.color}`}>{info.label}</span>
                      <span className="text-foreground">{renderDescription(entry)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-xs">{new Date(entry.date).toLocaleString(locale, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={`font-bold ${entry.amount > 0 ? "text-pos-success" : "text-destructive"}`}>
                        {entry.amount > 0 ? "+" : ""}{fmtMoney(entry.amount)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir={dir} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">{t("depositWithdrawal")}</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, type: "deposit" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${form.type === "deposit" ? "bg-pos-success text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>{t("deposit")}</button>
                <button onClick={() => setForm({ ...form, type: "withdrawal" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${form.type === "withdrawal" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"}`}>{t("withdrawal")}</button>
              </div>
              <input type="number" placeholder={t("amount")} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input placeholder={t("description")} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">{t("confirm")}</button>
            </div>
          </div>
        </div>
      )}

      {showExpense && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExpense(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir={dir} onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">{t("recordExpense")}</h2>
            <div className="space-y-3">
              <input placeholder={t("expenseDesc")} value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input type="number" placeholder={t("amount")} value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
                <option value={t("catRent")}>{t("catRent")}</option>
                <option value={t("catSalaries")}>{t("catSalaries")}</option>
                <option value={t("catUtilities")}>{t("catUtilities")}</option>
                <option value={t("catMaintenance")}>{t("catMaintenance")}</option>
                <option value={t("catTransport")}>{t("catTransport")}</option>
                <option value={t("catOther")}>{t("catOther")}</option>
              </select>
              <button onClick={handleExpense} className="w-full bg-destructive text-destructive-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">{t("recordExpense")}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashboxPage;
