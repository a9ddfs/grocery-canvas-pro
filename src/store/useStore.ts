import { create } from "zustand";
import { Product, CartItem, SaleRecord, initialProducts } from "@/data/products";
import { Supplier, PurchaseOrder, Customer, Debt, DebtPayment, Expense, CashboxEntry, Alert, Coupon, AppliedCoupon } from "@/data/types";

interface StoreState {
  products: Product[];
  cart: CartItem[];
  sales: SaleRecord[];
  suppliers: Supplier[];
  purchases: PurchaseOrder[];
  customers: Customer[];
  debts: Debt[];
  expenses: Expense[];
  cashbox: CashboxEntry[];
  alerts: Alert[];
  coupons: Coupon[];
  appliedCoupon: AppliedCoupon | null;
  priceMode: "retail" | "wholesale";

  // Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartSubtotal: () => number;
  cartTotal: () => number;
  cartDiscount: () => number;
  cartItemCount: () => number;
  setPriceMode: (mode: "retail" | "wholesale") => void;

  // Coupons
  addCoupon: (coupon: Omit<Coupon, "id" | "createdAt" | "usedCount">) => void;
  updateCoupon: (id: string, updates: Partial<Coupon>) => void;
  deleteCoupon: (id: string) => void;
  applyCouponCode: (code: string) => { ok: true } | { ok: false; reason: "not_found" | "inactive" | "expired" | "max_uses" | "min_purchase" };
  removeAppliedCoupon: () => void;

  // Sales
  completeSale: (paymentMethod: "cash" | "card" | "credit", customerId?: string) => SaleRecord | null;

  // Inventory
  updateStock: (productId: string, newStock: number) => void;
  getLowStockProducts: () => Product[];
  updateProduct: (productId: string, updates: Partial<Product>) => void;

  // Suppliers
  addSupplier: (supplier: Omit<Supplier, "id" | "createdAt">) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;

  // Purchases
  addPurchase: (purchase: Omit<PurchaseOrder, "id">) => void;

  // Customers
  addCustomer: (customer: Omit<Customer, "id" | "createdAt">) => void;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  // Debts
  addDebtPayment: (debtId: string, payment: Omit<DebtPayment, "id">) => void;

  // Expenses
  addExpense: (expense: Omit<Expense, "id">) => void;

  // Cashbox
  addCashboxEntry: (entry: Omit<CashboxEntry, "id">) => void;
  getCashboxBalance: () => number;

  // Alerts
  generateAlerts: () => void;
  dismissAlert: (id: string) => void;
}

const computeDiscount = (coupon: Coupon, subtotal: number): number => {
  if (coupon.type === "percentage") {
    return Math.min(subtotal, subtotal * (coupon.value / 100));
  }
  return Math.min(subtotal, coupon.value);
};

export const useStore = create<StoreState>((set, get) => ({
  products: initialProducts,
  cart: [],
  sales: generateMockSales(),
  suppliers: generateMockSuppliers(),
  purchases: [],
  customers: generateMockCustomers(),
  debts: [],
  expenses: generateMockExpenses(),
  cashbox: [],
  alerts: [],
  coupons: generateMockCoupons(),
  appliedCoupon: null,
  priceMode: "retail",

  setPriceMode: (mode) => set({ priceMode: mode }),

  addToCart: (product) => {
    const priceMode = get().priceMode;
    set((state) => {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return state;
        return {
          cart: state.cart.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          ),
        };
      }
      if (product.stock <= 0) return state;
      return { cart: [...state.cart, { ...product, quantity: 1, priceType: priceMode }] };
    });
    // Recompute applied coupon discount based on new subtotal
    get().applyCouponCode && refreshAppliedCoupon(get, set);
  },

  removeFromCart: (productId) => {
    set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) }));
    refreshAppliedCoupon(get, set);
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) }));
      refreshAppliedCoupon(get, set);
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      ),
    }));
    refreshAppliedCoupon(get, set);
  },

  clearCart: () => set({ cart: [], appliedCoupon: null }),

  cartSubtotal: () => {
    return get().cart.reduce((sum, item) => {
      const price = item.priceType === "wholesale" ? item.wholesalePrice : item.price;
      return sum + price * item.quantity;
    }, 0);
  },

  cartDiscount: () => get().appliedCoupon?.discountAmount ?? 0,

  cartTotal: () => {
    const subtotal = get().cartSubtotal();
    const discount = get().cartDiscount();
    return Math.max(0, subtotal - discount);
  },

  cartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  // Coupons
  addCoupon: (data) => {
    set((state) => ({
      coupons: [
        { ...data, code: data.code.toUpperCase().trim(), id: `cpn-${Date.now()}`, createdAt: new Date(), usedCount: 0 },
        ...state.coupons,
      ],
    }));
  },

  updateCoupon: (id, updates) => {
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === id ? { ...c, ...updates, code: updates.code ? updates.code.toUpperCase().trim() : c.code } : c
      ),
    }));
  },

  deleteCoupon: (id) => {
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== id),
      appliedCoupon: state.appliedCoupon?.couponId === id ? null : state.appliedCoupon,
    }));
  },

  applyCouponCode: (code) => {
    const state = get();
    const coupon = state.coupons.find((c) => c.code === code.toUpperCase().trim());
    if (!coupon) return { ok: false, reason: "not_found" } as const;
    if (!coupon.active) return { ok: false, reason: "inactive" } as const;
    if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return { ok: false, reason: "expired" } as const;
    if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return { ok: false, reason: "max_uses" } as const;
    const subtotal = state.cartSubtotal();
    if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) return { ok: false, reason: "min_purchase" } as const;
    const discountAmount = computeDiscount(coupon, subtotal);
    set({ appliedCoupon: { couponId: coupon.id, code: coupon.code, discountAmount } });
    return { ok: true } as const;
  },

  removeAppliedCoupon: () => set({ appliedCoupon: null }),

  completeSale: (paymentMethod, customerId) => {
    const state = get();
    if (state.cart.length === 0) return null;

    const subtotal = state.cartSubtotal();
    const discount = state.cartDiscount();
    const total = Math.max(0, subtotal - discount);
    const tax = total * 0.15;
    const sale: SaleRecord = {
      id: `sale-${Date.now()}`,
      items: [...state.cart],
      total,
      tax,
      discount: discount > 0 ? discount : undefined,
      couponCode: state.appliedCoupon?.code,
      grandTotal: total + tax,
      paymentMethod,
      customerId,
      date: new Date(),
    };

    const updatedProducts = state.products.map((p) => {
      const cartItem = state.cart.find((c) => c.id === p.id);
      if (cartItem) return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      return p;
    });

    const newCashboxEntry: CashboxEntry = {
      id: `cb-${Date.now()}`,
      type: "sale",
      amount: sale.grandTotal,
      description: `sale#${sale.id.slice(-6)}|${paymentMethod}`,
      date: new Date(),
      referenceId: sale.id,
    };

    let newDebts = state.debts;
    if (paymentMethod === "credit" && customerId) {
      const debt: Debt = {
        id: `debt-${Date.now()}`,
        customerId,
        saleId: sale.id,
        amount: sale.grandTotal,
        paidAmount: 0,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        status: "pending",
        payments: [],
      };
      newDebts = [debt, ...state.debts];
    }

    // Increment coupon usage if used
    let newCoupons = state.coupons;
    if (state.appliedCoupon) {
      newCoupons = state.coupons.map((c) =>
        c.id === state.appliedCoupon!.couponId ? { ...c, usedCount: c.usedCount + 1 } : c
      );
    }

    set({
      sales: [sale, ...state.sales],
      cart: [],
      products: updatedProducts,
      cashbox: [newCashboxEntry, ...state.cashbox],
      debts: newDebts,
      coupons: newCoupons,
      appliedCoupon: null,
    });

    return sale;
  },

  updateStock: (productId, newStock) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p
      ),
    }));
  },

  getLowStockProducts: () => {
    return get().products.filter((p) => p.stock <= p.minStock);
  },

  updateProduct: (productId, updates) => {
    set((state) => ({
      products: state.products.map((p) =>
        p.id === productId ? { ...p, ...updates } : p
      ),
    }));
  },

  // Suppliers
  addSupplier: (data) => {
    set((state) => ({
      suppliers: [...state.suppliers, { ...data, id: `sup-${Date.now()}`, createdAt: new Date() }],
    }));
  },
  updateSupplier: (id, updates) => {
    set((state) => ({
      suppliers: state.suppliers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  },
  deleteSupplier: (id) => {
    set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) }));
  },

  // Purchases
  addPurchase: (data) => {
    const state = get();
    const purchase: PurchaseOrder = { ...data, id: `po-${Date.now()}` };

    const updatedProducts = state.products.map((p) => {
      const item = data.items.find((i) => i.productId === p.id);
      if (item) return { ...p, stock: p.stock + item.quantity, costPrice: item.costPrice };
      return p;
    });

    const supplierName = state.suppliers.find((s) => s.id === data.supplierId)?.name || "supplier";
    const cashboxEntry: CashboxEntry = {
      id: `cb-${Date.now()}`,
      type: "purchase",
      amount: -data.total,
      description: `purchase|${supplierName}`,
      date: new Date(),
      referenceId: purchase.id,
    };

    set({
      purchases: [purchase, ...state.purchases],
      products: updatedProducts,
      cashbox: [cashboxEntry, ...state.cashbox],
    });
  },

  // Customers
  addCustomer: (data) => {
    set((state) => ({
      customers: [...state.customers, { ...data, id: `cust-${Date.now()}`, createdAt: new Date() }],
    }));
  },
  updateCustomer: (id, updates) => {
    set((state) => ({
      customers: state.customers.map((c) => (c.id === id ? { ...c, ...updates } : c)),
    }));
  },
  deleteCustomer: (id) => {
    set((state) => ({ customers: state.customers.filter((c) => c.id !== id) }));
  },

  // Debts
  addDebtPayment: (debtId, payment) => {
    set((state) => {
      const debt = state.debts.find((d) => d.id === debtId);
      if (!debt) return state;

      const newPayment: DebtPayment = { ...payment, id: `dp-${Date.now()}` };
      const newPaidAmount = debt.paidAmount + payment.amount;
      const newStatus = newPaidAmount >= debt.amount ? "paid" : "partial";

      const customerName = state.customers.find((c) => c.id === debt.customerId)?.name || "customer";
      const cashboxEntry: CashboxEntry = {
        id: `cb-${Date.now()}`,
        type: "debt_payment",
        amount: payment.amount,
        description: `debt_payment|${customerName}`,
        date: new Date(),
        referenceId: debtId,
      };

      return {
        debts: state.debts.map((d) =>
          d.id === debtId
            ? { ...d, paidAmount: newPaidAmount, status: newStatus, payments: [...d.payments, newPayment] }
            : d
        ),
        cashbox: [cashboxEntry, ...state.cashbox],
      };
    });
  },

  // Expenses
  addExpense: (data) => {
    const expense: Expense = { ...data, id: `exp-${Date.now()}` };
    const cashboxEntry: CashboxEntry = {
      id: `cb-${Date.now()}-e`,
      type: "expense",
      amount: -data.amount,
      description: `expense|${data.description}`,
      date: new Date(),
      referenceId: expense.id,
    };
    set((state) => ({
      expenses: [expense, ...state.expenses],
      cashbox: [cashboxEntry, ...state.cashbox],
    }));
  },

  // Cashbox
  addCashboxEntry: (data) => {
    set((state) => ({
      cashbox: [{ ...data, id: `cb-${Date.now()}` }, ...state.cashbox],
    }));
  },
  getCashboxBalance: () => {
    return get().cashbox.reduce((sum, entry) => sum + entry.amount, 0);
  },

  // Alerts
  generateAlerts: () => {
    const state = get();
    const alerts: Alert[] = [];

    state.products.forEach((p) => {
      if (p.stock === 0) {
        alerts.push({
          id: `alert-oos-${p.id}`,
          type: "out_of_stock",
          message: `${p.name} - out of stock`,
          i18nKey: "out_of_stock",
          i18nParams: { productId: p.id, name: p.name },
          severity: "critical",
          date: new Date(),
          dismissed: false,
          referenceId: p.id,
        });
      } else if (p.stock <= p.minStock) {
        alerts.push({
          id: `alert-ls-${p.id}`,
          type: "low_stock",
          message: `${p.name} - low stock`,
          i18nKey: "low_stock",
          i18nParams: { productId: p.id, name: p.name, stock: p.stock, minStock: p.minStock },
          severity: "warning",
          date: new Date(),
          dismissed: false,
          referenceId: p.id,
        });
      }
    });

    const now = new Date();
    state.debts.forEach((d) => {
      if (d.status !== "paid" && new Date(d.dueDate) < now) {
        const customer = state.customers.find((c) => c.id === d.customerId);
        alerts.push({
          id: `alert-debt-${d.id}`,
          type: "overdue_debt",
          message: `overdue debt`,
          i18nKey: "overdue_debt",
          i18nParams: { customerName: customer?.name || "customer", amount: (d.amount - d.paidAmount).toFixed(2) },
          severity: "critical",
          date: new Date(),
          dismissed: false,
          referenceId: d.id,
        });
      }
    });

    set({ alerts });
  },
  dismissAlert: (id) => {
    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? { ...a, dismissed: true } : a)),
    }));
  },
}));

// Helper: re-evaluate the applied coupon when cart changes (handles min_purchase / discount value)
function refreshAppliedCoupon(get: () => StoreState, set: (s: Partial<StoreState>) => void) {
  const state = get();
  const applied = state.appliedCoupon;
  if (!applied) return;
  const coupon = state.coupons.find((c) => c.id === applied.couponId);
  if (!coupon) {
    set({ appliedCoupon: null });
    return;
  }
  const subtotal = state.cartSubtotal();
  if (subtotal === 0) {
    set({ appliedCoupon: null });
    return;
  }
  if (coupon.minPurchase > 0 && subtotal < coupon.minPurchase) {
    set({ appliedCoupon: null });
    return;
  }
  set({ appliedCoupon: { ...applied, discountAmount: computeDiscount(coupon, subtotal) } });
}

// Mock data generators
function generateMockSales(): SaleRecord[] {
  const sales: SaleRecord[] = [];
  const products = initialProducts;
  const now = new Date();
  for (let day = 6; day >= 0; day--) {
    const numSales = Math.floor(Math.random() * 8) + 5;
    for (let s = 0; s < numSales; s++) {
      const numItems = Math.floor(Math.random() * 4) + 1;
      const items: CartItem[] = [];
      for (let i = 0; i < numItems; i++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        items.push({ ...product, quantity: qty, priceType: "retail" });
      }
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const tax = total * 0.15;
      const saleDate = new Date(now);
      saleDate.setDate(saleDate.getDate() - day);
      saleDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));
      sales.push({
        id: `mock-${day}-${s}`,
        items,
        total,
        tax,
        grandTotal: total + tax,
        paymentMethod: Math.random() > 0.4 ? "cash" : "card",
        date: saleDate,
      });
    }
  }
  return sales;
}

function generateMockSuppliers(): Supplier[] {
  return [
    { id: "sup-1", name: "Fresh Fruits Co.", phone: "0501234567", address: "Riyadh - Olaya", notes: "Main fruits supplier", createdAt: new Date() },
    { id: "sup-2", name: "United Dairy", phone: "0559876543", address: "Jeddah - Madinah Rd", notes: "Dairy & cheese", createdAt: new Date() },
    { id: "sup-3", name: "Golden Bakery", phone: "0531112233", address: "Dammam - Industrial", notes: "Bread & pastries", createdAt: new Date() },
  ];
}

function generateMockCustomers(): Customer[] {
  return [
    { id: "cust-1", name: "Ahmed Mohammed", phone: "0541234567", address: "Al-Salam", notes: "Loyal customer", createdAt: new Date() },
    { id: "cust-2", name: "Fahad Al-Otaibi", phone: "0559998877", address: "Al-Naseem", notes: "", createdAt: new Date() },
    { id: "cust-3", name: "Saad Al-Dosari", phone: "0531114455", address: "Al-Malaz", notes: "Buys wholesale", createdAt: new Date() },
  ];
}

function generateMockExpenses(): Expense[] {
  const now = new Date();
  return [
    { id: "exp-1", description: "Shop rent", amount: 5000, category: "Rent", date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { id: "exp-2", description: "Electricity bill", amount: 800, category: "Utilities", date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { id: "exp-3", description: "Staff salaries", amount: 8000, category: "Salaries", date: new Date(now.getFullYear(), now.getMonth(), 1) },
  ];
}

function generateMockCoupons(): Coupon[] {
  const future = new Date();
  future.setMonth(future.getMonth() + 3);
  return [
    { id: "cpn-1", code: "WELCOME10", type: "percentage", value: 10, minPurchase: 0, maxUses: 0, usedCount: 0, active: true, createdAt: new Date(), expiryDate: future },
    { id: "cpn-2", code: "SAVE20", type: "percentage", value: 20, minPurchase: 100, maxUses: 50, usedCount: 0, active: true, createdAt: new Date(), expiryDate: future },
    { id: "cpn-3", code: "FLAT15", type: "fixed", value: 15, minPurchase: 50, maxUses: 0, usedCount: 0, active: true, createdAt: new Date() },
  ];
}
