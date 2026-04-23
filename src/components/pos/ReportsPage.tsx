import { useMemo, useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, LineChart, Line,
} from "recharts";
import { FileText, TrendingUp, TrendingDown, ShoppingBag, Package, DollarSign, AlertTriangle, Users } from "lucide-react";

const tooltipStyle = { background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" };

const ReportsPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { sales, products, expenses, debts, customers } = useStore();
  const { t, dir, locale, lang, pn, fmt, fmtMoney } = useI18n();
  const [tab, setTab] = useState<"sales" | "products" | "inventory" | "debts" | "profits">("sales");

  const dailySales = useMemo(() => {
    const days: Record<string, { date: string; revenue: number; orders: number; profit: number }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      days[key] = { date: d.toLocaleDateString(locale, { month: "short", day: "numeric" }), revenue: 0, orders: 0, profit: 0 };
    }
    sales.forEach((s) => {
      const key = new Date(s.date).toISOString().split("T")[0];
      if (days[key]) {
        days[key].revenue += s.grandTotal;
        days[key].orders += 1;
        days[key].profit += s.items.reduce((sum, item) => {
          const cost = item.costPrice * item.quantity;
          const revenue = (item.priceType === "wholesale" ? item.wholesalePrice : item.price) * item.quantity;
          return sum + (revenue - cost);
        }, 0);
      }
    });
    return Object.values(days).slice(-7);
  }, [sales, locale]);

  const productStats = useMemo(() => {
    const stats: Record<string, { name: string; sold: number; revenue: number; profit: number }> = {};
    sales.forEach((s) => {
      s.items.forEach((item) => {
        if (!stats[item.id]) stats[item.id] = { name: pn(item.id, item.name), sold: 0, revenue: 0, profit: 0 };
        stats[item.id].sold += item.quantity;
        const rev = (item.priceType === "wholesale" ? item.wholesalePrice : item.price) * item.quantity;
        stats[item.id].revenue += rev;
        stats[item.id].profit += rev - (item.costPrice * item.quantity);
      });
    });
    const sorted = Object.values(stats).sort((a, b) => b.sold - a.sold);
    return { best: sorted.slice(0, 5), worst: sorted.slice(-5).reverse() };
  }, [sales, lang]);

  const totalRevenue = sales.reduce((s, sale) => s + sale.grandTotal, 0);
  const totalCost = sales.reduce((s, sale) => s + sale.items.reduce((a, i) => a + i.costPrice * i.quantity, 0), 0);
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);
  const grossProfit = totalRevenue - totalCost;
  const netProfit = grossProfit - totalExpenses;

  const totalDebts = debts.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
  const overdueDebts = debts.filter((d) => d.status !== "paid" && new Date(d.dueDate) < new Date());

  const tabs = [
    { id: "sales", label: t("tabSales"), icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "products", label: t("tabProducts"), icon: <Package className="w-4 h-4" /> },
    { id: "profits", label: t("tabProfits"), icon: <TrendingUp className="w-4 h-4" /> },
    { id: "inventory", label: t("tabInventory"), icon: <Package className="w-4 h-4" /> },
    { id: "debts", label: t("tabDebts"), icon: <Users className="w-4 h-4" /> },
  ];

  const colAlign = dir === "rtl" ? "text-right" : "text-left";

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" />
          {t("reportsTitle")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("dashboard")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("dashboard")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex gap-1 px-6 py-3 bg-card/50 border-b border-border overflow-x-auto">
        {tabs.map((tt) => (
          <button key={tt.id} onClick={() => setTab(tt.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${tab === tt.id ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-pos-surface-hover"}`}>
            {tt.icon}{tt.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-6">
        {tab === "sales" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label={t("totalSales")} value={fmtMoney(totalRevenue)} icon={<DollarSign className="w-5 h-5" />} color="primary" />
              <StatCard label={t("ordersCount")} value={`${sales.length}`} icon={<ShoppingBag className="w-5 h-5" />} color="success" />
              <StatCard label={t("avgOrder")} value={fmtMoney(sales.length > 0 ? totalRevenue / sales.length : 0)} icon={<TrendingUp className="w-5 h-5" />} color="info" />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">{t("dailySales7")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={dailySales}>
                  <defs><linearGradient id="cr" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(36,95%,55%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(36,95%,55%)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
                  <XAxis dataKey="date" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="revenue" stroke="hsl(36,95%,55%)" fill="url(#cr)" strokeWidth={2} name={t("revenue")} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </>
        )}

        {tab === "products" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pos-success" />
                {t("bestSelling")}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={productStats.best} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
                  <XAxis type="number" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(220,10%,55%)" fontSize={11} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sold" fill="hsl(142,71%,45%)" radius={[0,6,6,0]} name={t("qtySold")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-destructive" />
                {t("worstSelling")}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={productStats.worst} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
                  <XAxis type="number" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="hsl(220,10%,55%)" fontSize={11} width={80} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="sold" fill="hsl(0,72%,51%)" radius={[0,6,6,0]} name={t("qtySold")} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {tab === "profits" && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label={t("totalRevenue")} value={fmtMoney(totalRevenue)} icon={<DollarSign className="w-5 h-5" />} color="primary" />
              <StatCard label={t("costOfGoods")} value={fmtMoney(totalCost)} icon={<Package className="w-5 h-5" />} color="info" />
              <StatCard label={t("expenses")} value={fmtMoney(totalExpenses)} icon={<TrendingDown className="w-5 h-5" />} color="destructive" />
              <StatCard label={t("netProfit")} value={fmtMoney(netProfit)} icon={<TrendingUp className="w-5 h-5" />} color={netProfit >= 0 ? "success" : "destructive"} />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">{t("dailyProfits")}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,22%)" />
                  <XAxis dataKey="date" stroke="hsl(220,10%,55%)" fontSize={12} />
                  <YAxis stroke="hsl(220,10%,55%)" fontSize={12} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Line type="monotone" dataKey="profit" stroke="hsl(142,71%,45%)" strokeWidth={2} dot={{ r: 4 }} name={t("profit")} />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(36,95%,55%)" strokeWidth={2} dot={{ r: 4 }} name={t("revenue")} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">{t("expensesDetails")}</h3>
              <div className="space-y-2">
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-secondary/50 text-sm">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-destructive/20 text-destructive">{exp.category}</span>
                      <span className="text-foreground">{exp.description}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{new Date(exp.date).toLocaleDateString(locale)}</span>
                      <span className="font-bold text-destructive">{fmtMoney(exp.amount)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {tab === "inventory" && (
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">{t("inventoryReport")}</h3>
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border text-muted-foreground">
                <th className={`${colAlign} py-2 px-3`}>{t("product")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("qty")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("minStock")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("cost")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("retailPrice")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("wholesalePrice")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("inventoryValue")}</th>
                <th className={`${colAlign} py-2 px-3`}>{t("status")}</th>
              </tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="py-2 px-3 font-semibold text-foreground">{pn(p.id, p.name)}</td>
                    <td className="py-2 px-3">{p.stock}</td>
                    <td className="py-2 px-3">{p.minStock}</td>
                    <td className="py-2 px-3">{fmt(p.costPrice)}</td>
                    <td className="py-2 px-3">{fmt(p.price)}</td>
                    <td className="py-2 px-3">{fmt(p.wholesalePrice)}</td>
                    <td className="py-2 px-3 font-semibold">{fmt(p.stock * p.costPrice)}</td>
                    <td className="py-2 px-3">
                      {p.stock === 0 ? <span className="text-destructive font-semibold">{t("outOfStockShort")}</span> :
                       p.stock <= p.minStock ? <span className="text-destructive">{t("lowStock")}</span> :
                       <span className="text-pos-success">{t("available")}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot><tr className="border-t-2 border-border font-bold text-foreground">
                <td className="py-2 px-3">{t("totalLabel")}</td>
                <td className="py-2 px-3">{products.reduce((s, p) => s + p.stock, 0)}</td>
                <td className="py-2 px-3" colSpan={4}></td>
                <td className="py-2 px-3 text-primary">{fmtMoney(products.reduce((s, p) => s + p.stock * p.costPrice, 0))}</td>
                <td></td>
              </tr></tfoot>
            </table>
          </div>
        )}

        {tab === "debts" && (
          <>
            <div className="grid grid-cols-3 gap-4">
              <StatCard label={t("totalDebts")} value={fmtMoney(totalDebts)} icon={<DollarSign className="w-5 h-5" />} color="destructive" />
              <StatCard label={t("overdueDebts")} value={`${overdueDebts.length}`} icon={<AlertTriangle className="w-5 h-5" />} color="destructive" />
              <StatCard label={t("debtorCustomers")} value={`${new Set(debts.filter((d) => d.status !== "paid").map((d) => d.customerId)).size}`} icon={<Users className="w-5 h-5" />} color="info" />
            </div>
            <div className="bg-card rounded-xl border border-border p-5">
              <h3 className="font-bold text-foreground mb-4">{t("debtsByCustomer")}</h3>
              {customers.map((cust) => {
                const custDebts = debts.filter((d) => d.customerId === cust.id && d.status !== "paid");
                if (custDebts.length === 0) return null;
                const total = custDebts.reduce((s, d) => s + (d.amount - d.paidAmount), 0);
                return (
                  <div key={cust.id} className="mb-3 bg-secondary/50 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-foreground">{cust.name}</span>
                      <span className="font-bold text-destructive">{fmtMoney(total)}</span>
                    </div>
                    {custDebts.map((d) => (
                      <div key={d.id} className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{t("invoiceShort")} #{d.saleId.slice(-6)} | {t("dueDate")}: {new Date(d.dueDate).toLocaleDateString(locale)}</span>
                        <span className={new Date(d.dueDate) < new Date() ? "text-destructive" : ""}>{fmtMoney(d.amount - d.paidAmount)}</span>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon, color }: { label: string; value: string; icon: React.ReactNode; color: string }) => {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    success: "bg-pos-success/15 text-pos-success",
    info: "bg-pos-info/15 text-pos-info",
    destructive: "bg-destructive/15 text-destructive",
  };
  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>{icon}</div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground font-bold text-xl mt-0.5">{value}</p>
    </div>
  );
};

export default ReportsPage;
