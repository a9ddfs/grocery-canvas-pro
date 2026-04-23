import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";
import { Bell, X, AlertTriangle, Package, DollarSign } from "lucide-react";

const AlertsPanel = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { alerts, generateAlerts, dismissAlert } = useStore();
  const { t, pn, dir, fmtMoney, lang } = useI18n();

  useEffect(() => {
    generateAlerts();
  }, []);

  const activeAlerts = alerts.filter((a) => !a.dismissed);

  if (activeAlerts.length === 0) return null;

  const iconMap = {
    low_stock: <Package className="w-4 h-4" />,
    out_of_stock: <AlertTriangle className="w-4 h-4" />,
    overdue_debt: <DollarSign className="w-4 h-4" />,
    low_profit: <AlertTriangle className="w-4 h-4" />,
  };

  const renderMessage = (alert: typeof activeAlerts[0]) => {
    const p = alert.i18nParams || {};
    if (alert.type === "out_of_stock") {
      const name = p.productId ? pn(String(p.productId), String(p.name)) : String(p.name || "");
      return `${name} - ${t("outOfStockMsg")}`;
    }
    if (alert.type === "low_stock") {
      const name = p.productId ? pn(String(p.productId), String(p.name)) : String(p.name || "");
      return `${name} — ${t("remainingQty")}: ${p.stock} (${t("minLevel")}: ${p.minStock})`;
    }
    if (alert.type === "overdue_debt") {
      return `${t("overdueDebtMsg")} — ${p.customerName}: ${fmtMoney(parseFloat(String(p.amount || 0)))}`;
    }
    return alert.message;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2" dir={dir}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          {t("alerts")} ({activeAlerts.length})
        </h3>
      </div>
      {activeAlerts.slice(0, 5).map((alert) => (
        <div
          key={alert.id}
          className={`flex items-center justify-between py-2 px-3 rounded-lg text-xs ${
            alert.severity === "critical" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
          }`}
        >
          <div className="flex items-center gap-2">
            {iconMap[alert.type]}
            <span>{renderMessage(alert)}</span>
          </div>
          <button onClick={() => dismissAlert(alert.id)} className="p-1 hover:bg-background/20 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {activeAlerts.length > 5 && (
        <button onClick={() => onNavigate("inventory")} className="text-xs text-primary hover:underline w-full text-center">
          {t("showAll")} ({activeAlerts.length})
        </button>
      )}
    </div>
  );
};

export default AlertsPanel;
