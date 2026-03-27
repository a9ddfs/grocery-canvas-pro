import { ShoppingCart, CreditCard, Banknote, Trash2, Receipt } from "lucide-react";
import { CartItem } from "@/data/products";
import CartItemRow from "./CartItemRow";
import { useState } from "react";

interface CartPanelProps {
  items: CartItem[];
  total: number;
  itemCount: number;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const CartPanel = ({ items, total, itemCount, onUpdateQuantity, onRemove, onClear }: CartPanelProps) => {
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const tax = total * 0.15;
  const grandTotal = total + tax;

  const handlePay = (method: string) => {
    setPaymentDone(true);
    setTimeout(() => {
      setPaymentDone(false);
      setShowCheckout(false);
      onClear();
    }, 2000);
  };

  if (paymentDone) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <div className="w-20 h-20 rounded-full bg-pos-success/20 flex items-center justify-center animate-pop-in">
          <Receipt className="w-10 h-10 text-pos-success" />
        </div>
        <p className="text-xl font-bold text-foreground">تمت العملية بنجاح!</p>
        <p className="text-muted-foreground text-sm">المبلغ: {grandTotal.toFixed(2)} ر.س</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground text-lg">السلة</h2>
          {itemCount > 0 && (
            <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">
              {itemCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="text-muted-foreground hover:text-destructive transition-colors p-1.5 rounded-md hover:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-4 pos-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
            <ShoppingCart className="w-12 h-12 opacity-30" />
            <p className="text-sm">السلة فارغة</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
            />
          ))
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="p-4 border-t border-border space-y-3">
          {!showCheckout ? (
            <>
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>المجموع الفرعي</span>
                  <span>{total.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>ضريبة القيمة المضافة (15%)</span>
                  <span>{tax.toFixed(2)} ر.س</span>
                </div>
                <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border">
                  <span>الإجمالي</span>
                  <span className="text-primary">{grandTotal.toFixed(2)} ر.س</span>
                </div>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25 text-base"
              >
                الدفع ({grandTotal.toFixed(2)} ر.س)
              </button>
            </>
          ) : (
            <div className="space-y-3 animate-slide-in">
              <p className="text-center font-bold text-foreground">اختر طريقة الدفع</p>
              <p className="text-center text-primary font-bold text-2xl">{grandTotal.toFixed(2)} ر.س</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePay("cash")}
                  className="flex flex-col items-center gap-2 py-4 rounded-lg bg-pos-success/15 border border-pos-success/30 hover:bg-pos-success/25 transition-colors"
                >
                  <Banknote className="w-8 h-8 text-pos-success" />
                  <span className="text-sm font-semibold text-foreground">نقدي</span>
                </button>
                <button
                  onClick={() => handlePay("card")}
                  className="flex flex-col items-center gap-2 py-4 rounded-lg bg-pos-info/15 border border-pos-info/30 hover:bg-pos-info/25 transition-colors"
                >
                  <CreditCard className="w-8 h-8 text-pos-info" />
                  <span className="text-sm font-semibold text-foreground">بطاقة</span>
                </button>
              </div>
              <button
                onClick={() => setShowCheckout(false)}
                className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors"
              >
                رجوع
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPanel;
