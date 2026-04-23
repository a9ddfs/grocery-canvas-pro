import { SaleRecord } from "@/data/products";
import { X, Printer } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface ReceiptModalProps {
  sale: SaleRecord;
  onClose: () => void;
}

const ReceiptModal = ({ sale, onClose }: ReceiptModalProps) => {
  const { t, dir, lang, locale, fmt, fmtMoney, pn } = useI18n();

  const paymentLabel =
    sale.paymentMethod === "cash" ? t("cash") :
    sale.paymentMethod === "card" ? t("card") : t("credit");

  const paymentEmoji =
    sale.paymentMethod === "cash" ? "💵" :
    sale.paymentMethod === "card" ? "💳" : "📋";

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const itemsRows = sale.items.map((item) => `
      <tr>
        <td>${pn(item.id, item.name)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td>${fmt(item.priceType === "wholesale" ? item.wholesalePrice : item.price)}</td>
        <td>${fmt((item.priceType === "wholesale" ? item.wholesalePrice : item.price) * item.quantity)}</td>
      </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head>
  <meta charset="UTF-8">
  <title>${t("invoice")}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&family=Inter:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: ${lang === "ar" ? "'Cairo'" : "'Inter'"}, sans-serif; padding: 20px; max-width: 350px; margin: 0 auto; color: #1a1a1a; }
    .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
    .header h1 { font-size: 22px; font-weight: 700; }
    .header p { font-size: 11px; color: #666; margin-top: 4px; }
    .info { font-size: 12px; color: #555; margin-bottom: 15px; }
    .info div { display: flex; justify-content: space-between; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { font-size: 11px; color: #888; border-bottom: 1px solid #ddd; padding: 6px 0; text-align: ${dir === "rtl" ? "right" : "left"}; }
    td { font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .total-section { border-top: 2px dashed #ccc; padding-top: 10px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
    .discount { color: #16a34a; }
    .grand-total { font-size: 18px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; font-size: 12px; color: #888; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏪 ${t("storeName")}</h1>
    <p>${t("simplifiedTax")}</p>
  </div>
  <div class="info">
    <div><span>${t("invoiceNumber")}:</span><span>${sale.id.slice(-8)}</span></div>
    <div><span>${t("date")}:</span><span>${new Date(sale.date).toLocaleDateString(locale)}</span></div>
    <div><span>${t("time")}:</span><span>${new Date(sale.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span></div>
    <div><span>${t("paymentMethod")}:</span><span>${paymentLabel}</span></div>
    ${sale.couponCode ? `<div><span>${t("coupon")}:</span><span>${sale.couponCode}</span></div>` : ""}
  </div>
  <table>
    <thead><tr><th>${t("product")}</th><th>${t("qty")}</th><th>${t("price")}</th><th>${t("total")}</th></tr></thead>
    <tbody>${itemsRows}</tbody>
  </table>
  <div class="total-section">
    <div class="total-row"><span>${t("subtotal")}</span><span>${fmtMoney(sale.discount ? sale.total + sale.discount : sale.total)}</span></div>
    ${sale.discount ? `<div class="total-row discount"><span>${t("discount")} (${sale.couponCode || ""})</span><span>−${fmtMoney(sale.discount)}</span></div>` : ""}
    <div class="total-row"><span>${t("vat")}</span><span>${fmtMoney(sale.tax)}</span></div>
    <div class="total-row grand-total"><span>${t("total")}</span><span>${fmtMoney(sale.grandTotal)}</span></div>
  </div>
  <div class="footer">
    <p>${t("thankYou")} 🙏</p>
    <p>${t("goodDay")}</p>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const subtotalForDisplay = sale.discount ? sale.total + sale.discount : sale.total;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto animate-pop-in"
        dir={dir}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">{t("invoice")}</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-2xl mb-1">🏪</p>
            <h3 className="font-bold text-foreground text-lg">{t("storeName")}</h3>
            <p className="text-xs text-muted-foreground">{t("simplifiedTax")}</p>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
            <div className="flex justify-between"><span>{t("invoiceNumber")}:</span><span className="text-foreground font-semibold">{sale.id.slice(-8)}</span></div>
            <div className="flex justify-between"><span>{t("date")}:</span><span>{new Date(sale.date).toLocaleDateString(locale)}</span></div>
            <div className="flex justify-between"><span>{t("time")}:</span><span>{new Date(sale.date).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })}</span></div>
            <div className="flex justify-between"><span>{t("paymentMethod")}:</span><span>{paymentLabel} {paymentEmoji}</span></div>
            {sale.couponCode && <div className="flex justify-between"><span>{t("coupon")}:</span><span className="font-mono text-pos-success">{sale.couponCode}</span></div>}
          </div>

          <div className="space-y-2">
            {sale.items.map((item, i) => {
              const price = item.priceType === "wholesale" ? item.wholesalePrice : item.price;
              return (
                <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <div className="flex items-center gap-2">
                    <img src={item.image} alt={pn(item.id, item.name)} className="w-8 h-8 rounded object-cover" />
                    <div>
                      <p className="text-foreground font-medium text-xs">{pn(item.id, item.name)}</p>
                      <p className="text-muted-foreground text-[10px]">{item.quantity} × {fmt(price)}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-foreground text-xs">{fmt(price * item.quantity)}</span>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>{t("subtotal")}</span><span>{fmtMoney(subtotalForDisplay)}</span></div>
            {sale.discount && sale.discount > 0 && (
              <div className="flex justify-between text-pos-success"><span>{t("discount")}</span><span>−{fmtMoney(sale.discount)}</span></div>
            )}
            <div className="flex justify-between text-muted-foreground"><span>{t("vat")}</span><span>{fmtMoney(sale.tax)}</span></div>
            <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
              <span>{t("total")}</span>
              <span className="text-primary">{fmtMoney(sale.grandTotal)}</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            {t("printInvoice")}
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-pos-surface-hover transition-all">
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
