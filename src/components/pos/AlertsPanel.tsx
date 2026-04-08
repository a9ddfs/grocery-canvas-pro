import { useEffect } from "react";
import { useStore } from "@/store/useStore";
import { Bell, X, AlertTriangle, Package, DollarSign } from "lucide-react";

const AlertsPanel = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const { alerts, generateAlerts, dismissAlert } = useStore();

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

  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-2" dir="rtl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          تنبيهات ({activeAlerts.length})
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
            <span>{alert.message}</span>
          </div>
          <button onClick={() => dismissAlert(alert.id)} className="p-1 hover:bg-background/20 rounded">
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}
      {activeAlerts.length > 5 && (
        <button onClick={() => onNavigate("inventory")} className="text-xs text-primary hover:underline w-full text-center">
          عرض الكل ({activeAlerts.length})
        </button>
      )}
    </div>
  );
};

export default AlertsPanel;
