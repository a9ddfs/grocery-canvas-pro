import { SaleRecord } from "@/data/products";
import { X, Printer } from "lucide-react";

interface ReceiptModalProps {
  sale: SaleRecord;
  onClose: () => void;
}

const ReceiptModal = ({ sale, onClose }: ReceiptModalProps) => {
  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (!printWindow) return;

    const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>فاتورة</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Cairo', sans-serif; padding: 20px; max-width: 350px; margin: 0 auto; color: #1a1a1a; }
    .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 15px; margin-bottom: 15px; }
    .header h1 { font-size: 22px; font-weight: 700; }
    .header p { font-size: 11px; color: #666; margin-top: 4px; }
    .info { font-size: 12px; color: #555; margin-bottom: 15px; }
    .info div { display: flex; justify-content: space-between; margin-bottom: 3px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th { font-size: 11px; color: #888; border-bottom: 1px solid #ddd; padding: 6px 0; text-align: right; }
    td { font-size: 12px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .total-section { border-top: 2px dashed #ccc; padding-top: 10px; }
    .total-row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 4px; }
    .grand-total { font-size: 18px; font-weight: 700; margin-top: 8px; padding-top: 8px; border-top: 1px solid #ddd; }
    .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 2px dashed #ccc; font-size: 12px; color: #888; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>🏪 بقالة السعادة</h1>
    <p>فاتورة ضريبية مبسطة</p>
  </div>
  <div class="info">
    <div><span>رقم الفاتورة:</span><span>${sale.id.slice(-8)}</span></div>
    <div><span>التاريخ:</span><span>${new Date(sale.date).toLocaleDateString("ar-SA")}</span></div>
    <div><span>الوقت:</span><span>${new Date(sale.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span></div>
    <div><span>طريقة الدفع:</span><span>${sale.paymentMethod === "cash" ? "نقدي" : "بطاقة"}</span></div>
  </div>
  <table>
    <thead><tr><th>المنتج</th><th>الكمية</th><th>السعر</th><th>المجموع</th></tr></thead>
    <tbody>
      ${sale.items.map((item) => `
        <tr>
          <td>${item.name}</td>
          <td style="text-align:center">${item.quantity}</td>
          <td>${item.price.toFixed(2)}</td>
          <td>${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  <div class="total-section">
    <div class="total-row"><span>المجموع الفرعي</span><span>${sale.total.toFixed(2)} ر.س</span></div>
    <div class="total-row"><span>ضريبة القيمة المضافة (15%)</span><span>${sale.tax.toFixed(2)} ر.س</span></div>
    <div class="total-row grand-total"><span>الإجمالي</span><span>${sale.grandTotal.toFixed(2)} ر.س</span></div>
  </div>
  <div class="footer">
    <p>شكراً لتسوقكم معنا! 🙏</p>
    <p>نتمنى لكم يوماً سعيداً</p>
  </div>
  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-border w-full max-w-md max-h-[90vh] overflow-y-auto animate-pop-in"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-bold text-foreground text-lg">الفاتورة</h2>
          <button onClick={onClose} className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="p-5 space-y-4">
          <div className="text-center">
            <p className="text-2xl mb-1">🏪</p>
            <h3 className="font-bold text-foreground text-lg">بقالة السعادة</h3>
            <p className="text-xs text-muted-foreground">فاتورة ضريبية مبسطة</p>
          </div>

          <div className="space-y-1 text-xs text-muted-foreground bg-secondary/50 rounded-lg p-3">
            <div className="flex justify-between"><span>رقم الفاتورة:</span><span className="text-foreground font-semibold">{sale.id.slice(-8)}</span></div>
            <div className="flex justify-between"><span>التاريخ:</span><span>{new Date(sale.date).toLocaleDateString("ar-SA")}</span></div>
            <div className="flex justify-between"><span>الوقت:</span><span>{new Date(sale.date).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}</span></div>
            <div className="flex justify-between"><span>طريقة الدفع:</span><span>{sale.paymentMethod === "cash" ? "نقدي 💵" : "بطاقة 💳"}</span></div>
          </div>

          {/* Items */}
          <div className="space-y-2">
            {sale.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm py-1.5 border-b border-border last:border-0">
                <div className="flex items-center gap-2">
                  <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                  <div>
                    <p className="text-foreground font-medium text-xs">{item.name}</p>
                    <p className="text-muted-foreground text-[10px]">{item.quantity} × {item.price.toFixed(2)}</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground text-xs">{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="border-t border-border pt-3 space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span>{sale.total.toFixed(2)} ر.س</span></div>
            <div className="flex justify-between text-muted-foreground"><span>ضريبة (15%)</span><span>{sale.tax.toFixed(2)} ر.س</span></div>
            <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
              <span>الإجمالي</span>
              <span className="text-primary">{sale.grandTotal.toFixed(2)} ر.س</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border flex gap-2">
          <button
            onClick={handlePrint}
            className="flex-1 bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            طباعة الفاتورة
          </button>
          <button onClick={onClose} className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-pos-surface-hover transition-all">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;
