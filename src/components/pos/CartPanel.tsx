import { ShoppingCart, CreditCard, Banknote, Trash2, HandCoins, Tag, X } from "lucide-react";
import { CartItem } from "@/data/products";
import { Customer } from "@/data/types";
import CartItemRow from "./CartItemRow";
import { useState } from "react";
import { useStore } from "@/store/useStore";
import { useI18n } from "@/lib/i18n";

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
  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState("");
  const { applyCouponCode, removeAppliedCoupon, appliedCoupon, cartSubtotal, cartDiscount } = useStore();
  const { t, dir, fmtMoney } = useI18n();

  const subtotal = cartSubtotal();
  const discount = cartDiscount();
  const tax = total * 0.15;
  const grandTotal = total + tax;

  const handleApplyCoupon = () => {
    if (!couponInput.trim()) return;
    const result = applyCouponCode(couponInput);
    if (result.ok) {
      setCouponInput("");
      setCouponError("");
    } else {
      const map: Record<string, string> = {
        not_found: t("invalidCoupon"),
        inactive: t("couponInactive"),
        expired: t("couponExpired"),
        max_uses: t("couponMaxedOut"),
        min_purchase: t("couponMinNotMet"),
      };
      setCouponError(map[result.reason] || t("invalidCoupon"));
    }
  };

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
    <div className="h-full flex flex-col" dir={dir}>
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-5 h-5 text-primary" />
          <h2 className="font-bold text-foreground text-lg">{t("cart")}</h2>
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
            <p className="text-sm">{t("emptyCart")}</p>
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
              {/* Coupon section */}
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-pos-success/10 border border-pos-success/30 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-pos-success" />
                    <span className="font-mono font-bold text-pos-success">{appliedCoupon.code}</span>
                    <span className="text-muted-foreground text-xs">−{fmtMoney(discount)}</span>
                  </div>
                  <button onClick={() => removeAppliedCoupon()} className="text-muted-foreground hover:text-destructive">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex gap-2">
                    <input
                      placeholder={t("couponCode")}
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      className="flex-1 bg-secondary text-foreground px-3 py-2 rounded-lg border border-border text-sm font-mono uppercase"
                    />
                    <button onClick={handleApplyCoupon} className="px-3 py-2 bg-secondary text-secondary-foreground rounded-lg text-xs font-semibold hover:bg-primary hover:text-primary-foreground transition-all flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" />
                      {t("applyCoupon")}
                    </button>
                  </div>
                  {couponError && <p className="text-destructive text-xs mt-1">{couponError}</p>}
                </div>
              )}

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground"><span>{t("subtotal")}</span><span>{fmtMoney(subtotal)}</span></div>
                {discount > 0 && (
                  <div className="flex justify-between text-pos-success"><span>{t("discount")}</span><span>−{fmtMoney(discount)}</span></div>
                )}
                <div className="flex justify-between text-muted-foreground"><span>{t("vat")}</span><span>{fmtMoney(tax)}</span></div>
                <div className="flex justify-between text-foreground font-bold text-lg pt-2 border-t border-border"><span>{t("total")}</span><span className="text-primary">{fmtMoney(grandTotal)}</span></div>
              </div>
              <button onClick={() => setShowCheckout(true)} className="w-full bg-primary text-primary-foreground font-bold py-3.5 rounded-lg hover:brightness-110 transition-all shadow-lg shadow-primary/25 text-base">
                {t("pay")} ({fmtMoney(grandTotal)})
              </button>
            </>
          ) : showCredit ? (
            <div className="space-y-3 animate-slide-in">
              <p className="text-center font-bold text-foreground">{t("creditSale")}</p>
              <select value={creditCustomer} onChange={(e) => setCreditCustomer(e.target.value)} className="w-full bg-secondary text-foreground px-3 py-2.5 rounded-lg border border-border text-sm">
                <option value="">{t("selectCustomer")}</option>
                {customers.map((c) => <option key={c.id} value={c.id}>{c.name} - {c.phone}</option>)}
              </select>
              <button onClick={handleCredit} disabled={!creditCustomer} className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-lg hover:brightness-110 transition-all disabled:opacity-50">
                {t("confirmCredit")} ({fmtMoney(grandTotal)})
              </button>
              <button onClick={() => setShowCredit(false)} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors">{t("back")}</button>
            </div>
          ) : (
            <div className="space-y-3 animate-slide-in">
              <p className="text-center font-bold text-foreground">{t("choosePayment")}</p>
              <p className="text-center text-primary font-bold text-2xl">{fmtMoney(grandTotal)}</p>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => handlePay("cash")} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-pos-success/15 border border-pos-success/30 hover:bg-pos-success/25 transition-colors">
                  <Banknote className="w-7 h-7 text-pos-success" />
                  <span className="text-xs font-semibold text-foreground">{t("cash")}</span>
                </button>
                <button onClick={() => handlePay("card")} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-pos-info/15 border border-pos-info/30 hover:bg-pos-info/25 transition-colors">
                  <CreditCard className="w-7 h-7 text-pos-info" />
                  <span className="text-xs font-semibold text-foreground">{t("card")}</span>
                </button>
                <button onClick={() => setShowCredit(true)} className="flex flex-col items-center gap-2 py-3 rounded-lg bg-primary/15 border border-primary/30 hover:bg-primary/25 transition-colors">
                  <HandCoins className="w-7 h-7 text-primary" />
                  <span className="text-xs font-semibold text-foreground">{t("credit")}</span>
                </button>
              </div>
              <button onClick={() => setShowCheckout(false)} className="w-full text-muted-foreground text-sm py-2 hover:text-foreground transition-colors">{t("back")}</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CartPanel;
