import { ShoppingCart, CreditCard, Banknote, Trash2, Users, HandCoins } from "lucide-react";
import { CartItem, Customer } from "@/data/products";
import CartItemRow from "./CartItemRow";
import { useState } from "react";

interface CartPanelProps {
  items: CartItem[];
  total: number;
  itemCount: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompleteSale: (method: "cash" | "card" | "credit", customerId?: string) => void;
  customers: Customer[];
}

const CartPanel = ({ items, total, itemCount, onUpdateQuantity, onRemove, onClear, onCompleteSale, customers }: CartPanelProps) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [creditCustomer, setCreditCustomer] = useState("");
  const [showCredit, setShowCredit] = useState(false);
  const tax = total * 0.15;
  const grandTotal = total + tax;

  const handlePay = (method: "cash" | "card") => {
    onCompleteSale(method);
    setShowCheckout(false);
  };

  const handleCredit = () => {
    if (!creditCustomer) return;
    onCompleteSale("credit", creditCustomer);
    setShowCheckout(false);
    setShowCredit(false);
    setCreditCustomer("");
  };

  return (
    <div className="h-full flex flex-col" dir="rtl">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground text-lg">السلة</h2>
          {itemCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{itemCount}</span>
          )}
        </div>
        {items.length > 0 && (
          <button onClick={onClear} className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pos-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm">السلة فارغة</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow key={item.id} item={item} onUpdateQuantity={onUpdateQuantity} onRemove={onRemove} />
          ))
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t border-border space-y-3">
          {!showCheckout ? (
            <>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>المجموع الفرعي</span><span>{total.toFixed(2)} ر.س</span></div>
                <div className="flex justify-between text-muted-foreground"><span>ضريبة القيمة المضافة (15%)</span><span>{tax.toFixed(2)} ر.س</span></div>
                <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border"><span>الإجمالي</span><span className="text-primary">{grandTotal.toFixed(2)} ر.س</span></div>
              </div>
              <button onClick={() => setShowCheckout(true)} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25 text-base">
                الدفع ({grandTotal.toFixed(2)} ر.س)
              </button>
            </>
          ) : showCredit ? (
            <div className="space-y-3 animate-slide-in">
              <p className="text-center font-bold text-foreground">البيع بالآجل</p>
              <select value={creditCustomer} onChange={(e) => setCreditCustomer(e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
                <option value="">اختر العميل</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
              </select>
              <button onClick={handleCredit} disabled={!creditCustomer} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                تأكيد البيع بالآجل ({grandTotal.toFixed(2)} ر.س)
              </button>
              <button onClick={() => setShowCredit(false)} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors">رجوع</button>
            </div>
          ) : (
            <div className="space-y-3 animate-slide-in">
              <p className="text-center font-bold text-foreground">اختر طريقة الدفع</p>
              <p className="text-center text-primary font-bold text-2xl">{grandTotal.toFixed(2)} ر.س</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handlePay("cash")} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-pos-success/15 border border-pos-success/30 hover:bg-pos-success/25 transition-colors">
                  <Banknote className="w-7 h-7 text-pos-success" />
                  <span className="text-xs font-semibold text-foreground">نقدي</span>
                </button>
                <button onClick={() => handlePay("card")} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-pos-info/15 border border-pos-info/30 hover:bg-pos-info/25 transition-colors">
                  <CreditCard className="w-7 h-7 text-pos-info" />
                  <span className="text-xs font-semibold text-foreground">بطاقة</span>
                </button>
                <button onClick={() => setShowCredit(true)} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-primary/15 border border-primary/30 hover:bg-primary/25 transition-colors">
                  <HandCoins className="w-7 h-7 text-primary" />
                  <span className="text-xs font-semibold text-foreground">آجل</span>
                </button>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors">رجوع</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPanel;
