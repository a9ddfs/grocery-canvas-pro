import { useMemo } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import LangToggle from "@/components/LangToggle";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, Legend,
} from "recharts";
import { TrendingUp, DollarSign, ShoppingBag, AlertTriangle, Package } from "lucide-react";

const CHART_COLORS = [
  "hsl(36, 95%, 55%)", "hsl(142, 71%, 45%)", "hsl(200, 80%, 55%)",
  "hsl(0, 72%, 51%)", "hsl(280, 60%, 55%)", "hsl(45, 90%, 50%)",
];

const Dashboard = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { sales, products } = useStore();
  const { t, dir, locale, lang, fmt, fmtMoney } = useI18n();

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todaySales = sales.filter((s) => new Date(s.date) >= today);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.grandTotal, 0);
    const todayItems = todaySales.reduce((sum, s) => sum + s.items.reduce((a, i) => a + i.quantity, 0), 0);
    const totalRevenue = sales.reduce((sum, s) => sum + s.grandTotal, 0);
    const lowStock = products.filter((p) => p.stock <= 10).length;
    return { todaySales: todaySales.length, todayRevenue, todayItems, totalRevenue, lowStock };
  }, [sales, products]);

  const dailyData = useMemo(() => {
    const days: Record<string, { name: string; revenue: number; orders: number }> = {};
    const dayNamesAr = ["الأحد", "الإثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const dayNamesEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const dayNames = lang === "ar" ? dayNamesAr : dayNamesEn;

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      days[key] = { name: dayNames[d.getDay()], revenue: 0, orders: 0 };
    }

    sales.forEach((s) => {
      const key = new Date(s.date).toDateString();
      if (days[key]) {
        days[key].revenue += s.grandTotal;
        days[key].orders += 1;
      }
    });

    return Object.values(days);
  }, [sales, lang]);

  const categoryData = useMemo(() => {
    const cats: Record<string, number> = {};
    const catLabel = (k: string) =>
      k === "fruits" ? t("catFruits") :
      k === "vegetables" ? t("catVegetables") :
      k === "dairy" ? t("catDairy") :
      k === "bakery" ? t("catBakery") :
      k === "drinks" ? t("catDrinks") : t("catCanned");
    sales.forEach((s) => {
      s.items.forEach((item) => {
        const catName = catLabel(item.category);
        cats[catName] = (cats[catName] || 0) + item.price * item.quantity;
      });
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value: Math.round(value) }));
  }, [sales, lang]);

  const paymentData = useMemo(() => {
    const cash = sales.filter((s) => s.paymentMethod === "cash").length;
    const card = sales.filter((s) => s.paymentMethod === "card").length;
    return [
      { name: t("cash"), value: cash },
      { name: t("card"), value: card },
    ];
  }, [sales, lang]);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden" dir={dir}>
      <header className="flex items-center justify-between px-6 py-3 bg-card border-b border-border">
        <h1 className="font-bold text-foreground text-xl font-display flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-primary" />
          {t("dashboard")}
        </h1>
        <div className="flex gap-2 items-center">
          <button onClick={() => onNavigate("pos")} className="px-3 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:brightness-110 transition-all">{t("cashier")}</button>
          <button onClick={() => onNavigate("inventory")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("inventory")}</button>
          <button onClick={() => onNavigate("suppliers")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("suppliers")}</button>
          <button onClick={() => onNavigate("customers")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("customers")}</button>
          <button onClick={() => onNavigate("reports")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("reports")}</button>
          <button onClick={() => onNavigate("cashbox")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("cashbox")}</button>
          <button onClick={() => onNavigate("coupons")} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-semibold hover:bg-pos-surface-hover transition-all">{t("coupons")}</button>
          <LangToggle />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 pos-scrollbar space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<DollarSign className="w-5 h-5" />} label={t("todaySales")} value={fmtMoney(stats.todayRevenue)} color="primary" />
          <StatCard icon={<ShoppingBag className="w-5 h-5" />} label={t("todayOrders")} value={`${stats.todaySales}`} color="success" />
          <StatCard icon={<Package className="w-5 h-5" />} label={t("todayItemsSold")} value={`${stats.todayItems}`} color="info" />
          <StatCard icon={<AlertTriangle className="w-5 h-5" />} label={t("lowStockCount")} value={`${stats.lowStock}`} color="destructive" onClick={() => onNavigate("inventory")} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">{t("weeklySales")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(36, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(36, 95%, 55%)" fill="url(#colorRevenue)" strokeWidth={2} name={t("revenue")} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">{t("dailyOrders")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 22%)" />
                <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                <Bar dataKey="orders" fill="hsl(142, 71%, 45%)" radius={[6, 6, 0, 0]} name={t("orders")} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">{t("salesByCategory")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value">
                  {categoryData.map((_, index) => (
                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card rounded-xl border border-border p-5">
            <h3 className="font-bold text-foreground mb-4">{t("paymentMethods")}</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={paymentData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                  <Cell fill="hsl(142, 71%, 45%)" />
                  <Cell fill="hsl(200, 80%, 55%)" />
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 14%)", border: "1px solid hsl(220, 15%, 22%)", borderRadius: "8px", color: "hsl(40, 20%, 95%)" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold text-foreground mb-4">{t("recentSales")}</h3>
          <div className="space-y-2">
            {sales.slice(0, 8).map((sale) => (
              <div key={sale.id} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-secondary/50 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    sale.paymentMethod === "cash" ? "bg-pos-success/20 text-pos-success" : "bg-pos-info/20 text-pos-info"
                  }`}>
                    {sale.paymentMethod === "cash" ? t("cash") : t("card")}
                  </span>
                  <span className="text-muted-foreground">
                    {sale.items.length} {t("pieces")}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground text-xs">
                    {new Date(sale.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="font-bold text-primary">{fmtMoney(sale.grandTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color, onClick }: { icon: React.ReactNode; label: string; value: string; color: string; onClick?: () => void }) => {
  const colorMap: Record<string, string> = {
    primary: "bg-primary/15 text-primary",
    success: "bg-pos-success/15 text-pos-success",
    info: "bg-pos-info/15 text-pos-info",
    destructive: "bg-destructive/15 text-destructive",
  };

  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-xl border border-border p-4 ${onClick ? "cursor-pointer hover:border-primary/50 transition-colors" : ""}`}
    >
      <div className={`w-10 h-10 rounded-lg ${colorMap[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="text-foreground font-bold text-xl mt-0.5">{value}</p>
    </div>
  );
};

export default Dashboard;
