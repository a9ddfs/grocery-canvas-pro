import { useState } from "react";
import { useStore } from "@/store/useStore";
import { Wallet, Plus, ArrowUpCircle, ArrowDownCircle, DollarSign, Receipt, TrendingUp, TrendingDown, Minus } from "lucide-react";

const CashboxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { cashbox, getCashboxBalance, addCashboxEntry, addExpense } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [form, setForm] = useState({ type: "deposit" as "deposit" | "withdrawal", amount: "", description: "" });
  const [expenseForm, setExpenseForm] = useState({ description: "", amount: "", category: "أخرى" });

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
    setExpenseForm({ description: "", amount: "", category: "أخرى" });
    setShowExpense(false);
  };

  const typeLabels: Record<string, { label: string; color: string }> = {
    sale: { label: "بيع", color: "text-pos-success" },
    purchase: { label: "شراء", color: "text-destructive" },
    expense: { label: "مصروف", color: "text-destructive" },
    debt_payment: { label: "سداد دين", color: "text-pos-success" },
    deposit: { label: "إيداع", color: "text-pos-info" },
    withdrawal: { label: "سحب", color: "text-primary" },
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <Wallet className="w-6 h-6 text-primary" />
          الصندوق
        </h1>
        <div className="flex gap-2">
          <button onClick={() => setShowExpense(true)} className="px-3 py-2 bg-destructive text-destructive-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Minus className="w-4 h-4" />
            مصروف
          </button>
          <button onClick={() => setShowAdd(true)} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            إيداع / سحب
          </button>
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">الكاشير</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">لوحة التحكم</button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center mb-3"><DollarSign className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">رصيد الصندوق</p>
            <p className={`font-bold text-xl mt-0.5 ${balance >= 0 ? "text-pos-success" : "text-destructive"}`}>{balance.toFixed(2)} ر.س</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-pos-success/15 text-pos-success flex items-center justify-center mb-3"><ArrowUpCircle className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">إجمالي الواردات</p>
            <p className="text-pos-success font-bold text-xl mt-0.5">{totalIn.toFixed(2)} ر.س</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="w-10 h-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center mb-3"><ArrowDownCircle className="w-5 h-5" /></div>
            <p className="text-muted-foreground text-xs">إجمالي الصادرات</p>
            <p className="text-destructive font-bold text-xl mt-0.5">{totalOut.toFixed(2)} ر.س</p>
          </div>
        </div>

        {/* Transactions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4">سجل الحركات</h3>
          {cashbox.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">لا توجد حركات بعد</p>
          ) : (
            <div className="space-y-2">
              {cashbox.map((entry) => {
                const info = typeLabels[entry.type] || { label: entry.type, color: "text-foreground" };
                return (
                  <div key={entry.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm">
                    <div className="flex items-center gap-3">
                      {entry.amount > 0 ? <ArrowUpCircle className="w-4 h-4 text-pos-success" /> : <ArrowDownCircle className="w-4 h-4 text-destructive" />}
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${info.color} bg-current/10`} style={{ backgroundColor: "transparent" }}>
                        <span className={info.color}>{info.label}</span>
                      </span>
                      <span className="text-foreground">{entry.description}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground text-xs">{new Date(entry.date).toLocaleString("ar-SA", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      <span className={`font-bold ${entry.amount > 0 ? "text-pos-success" : "text-destructive"}`}>
                        {entry.amount > 0 ? "+" : ""}{entry.amount.toFixed(2)} ر.س
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Deposit/Withdrawal Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowAdd(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">إيداع / سحب</h2>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setForm({ ...form, type: "deposit" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${form.type === "deposit" ? "bg-pos-success text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}>إيداع</button>
                <button onClick={() => setForm({ ...form, type: "withdrawal" })} className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${form.type === "withdrawal" ? "bg-destructive text-destructive-foreground" : "bg-secondary text-secondary-foreground"}`}>سحب</button>
              </div>
              <input type="number" placeholder="المبلغ" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input placeholder="الوصف" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <button onClick={handleAdd} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">تأكيد</button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Modal */}
      {showExpense && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowExpense(false)}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-md p-5 animate-pop-in" dir="rtl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-bold text-foreground text-lg mb-4">تسجيل مصروف</h2>
            <div className="space-y-3">
              <input placeholder="وصف المصروف" value={expenseForm.description} onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <input type="number" placeholder="المبلغ" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm" />
              <select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
                <option value="إيجار">إيجار</option>
                <option value="رواتب">رواتب</option>
                <option value="مرافق">مرافق (كهرباء/ماء)</option>
                <option value="صيانة">صيانة</option>
                <option value="نقل">نقل</option>
                <option value="أخرى">أخرى</option>
              </select>
              <button onClick={handleExpense} className="w-full bg-destructive text-destructive-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all">تسجيل المصروف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CashboxPage;
