import { create } from "zustand";
import { Product, CartItem, SaleRecord, initialProducts } from "@/data/products";
import { Supplier, PurchaseOrder, Customer, Debt, DebtPayment, Expense, CashboxEntry, Alert } from "@/data/types";

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
  priceMode: "retail" | "wholesale";

  // Cart
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartItemCount: () => number;
  setPriceMode: (mode: "retail" | "wholesale") => void;

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
  },

  removeFromCart: (productId) => {
    set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) }));
  },

  updateCartQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      set((state) => ({ cart: state.cart.filter((item) => item.id !== productId) }));
      return;
    }
    set((state) => ({
      cart: state.cart.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
      ),
    }));
  },

  clearCart: () => set({ cart: [] }),

  cartTotal: () => {
    return get().cart.reduce((sum, item) => {
      const price = item.priceType === "wholesale" ? item.wholesalePrice : item.price;
      return sum + price * item.quantity;
    }, 0);
  },

  cartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  completeSale: (paymentMethod, customerId) => {
    const state = get();
    if (state.cart.length === 0) return null;

    const total = state.cartTotal();
    const tax = total * 0.15;
    const sale: SaleRecord = {
      id: `sale-${Date.now()}`,
      items: [...state.cart],
      total,
      tax,
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
      description: `بيع #${sale.id.slice(-6)} - ${paymentMethod === "cash" ? "نقدي" : paymentMethod === "card" ? "بطاقة" : "آجل"}`,
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

    set({
      sales: [sale, ...state.sales],
      cart: [],
      products: updatedProducts,
      cashbox: [newCashboxEntry, ...state.cashbox],
      debts: newDebts,
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

    // Update stock for purchased items
    const updatedProducts = state.products.map((p) => {
      const item = data.items.find((i) => i.productId === p.id);
      if (item) return { ...p, stock: p.stock + item.quantity, costPrice: item.costPrice };
      return p;
    });

    const cashboxEntry: CashboxEntry = {
      id: `cb-${Date.now()}`,
      type: "purchase",
      amount: -data.total,
      description: `شراء من ${state.suppliers.find((s) => s.id === data.supplierId)?.name || "مورد"}`,
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

      const cashboxEntry: CashboxEntry = {
        id: `cb-${Date.now()}`,
        type: "debt_payment",
        amount: payment.amount,
        description: `سداد دين - ${state.customers.find((c) => c.id === debt.customerId)?.name || "عميل"}`,
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
      description: `مصروف: ${data.description}`,
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

    // Low/out of stock
    state.products.forEach((p) => {
      if (p.stock === 0) {
        alerts.push({
          id: `alert-oos-${p.id}`,
          type: "out_of_stock",
          message: `${p.name} نفذ من المخزون!`,
          severity: "critical",
          date: new Date(),
          dismissed: false,
          referenceId: p.id,
        });
      } else if (p.stock <= p.minStock) {
        alerts.push({
          id: `alert-ls-${p.id}`,
          type: "low_stock",
          message: `${p.name} - الكمية المتبقية: ${p.stock} (الحد الأدنى: ${p.minStock})`,
          severity: "warning",
          date: new Date(),
          dismissed: false,
          referenceId: p.id,
        });
      }
    });

    // Overdue debts
    const now = new Date();
    state.debts.forEach((d) => {
      if (d.status !== "paid" && new Date(d.dueDate) < now) {
        const customer = state.customers.find((c) => c.id === d.customerId);
        alerts.push({
          id: `alert-debt-${d.id}`,
          type: "overdue_debt",
          message: `دين متأخر - ${customer?.name || "عميل"}: ${(d.amount - d.paidAmount).toFixed(2)} ر.س`,
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
    { id: "sup-1", name: "شركة الفواكه الطازجة", phone: "0501234567", address: "الرياض - حي العليا", notes: "مورد فواكه رئيسي", createdAt: new Date() },
    { id: "sup-2", name: "مؤسسة الألبان المتحدة", phone: "0559876543", address: "جدة - طريق المدينة", notes: "ألبان وأجبان", createdAt: new Date() },
    { id: "sup-3", name: "مصنع المخبوزات الذهبية", phone: "0531112233", address: "الدمام - المنطقة الصناعية", notes: "خبز ومعجنات", createdAt: new Date() },
  ];
}

function generateMockCustomers(): Customer[] {
  return [
    { id: "cust-1", name: "أحمد محمد", phone: "0541234567", address: "حي السلام", notes: "عميل دائم", createdAt: new Date() },
    { id: "cust-2", name: "فهد العتيبي", phone: "0559998877", address: "حي النسيم", notes: "", createdAt: new Date() },
    { id: "cust-3", name: "سعد الدوسري", phone: "0531114455", address: "حي الملز", notes: "يشتري بالجملة", createdAt: new Date() },
  ];
}

function generateMockExpenses(): Expense[] {
  const now = new Date();
  return [
    { id: "exp-1", description: "إيجار المحل", amount: 5000, category: "إيجار", date: new Date(now.getFullYear(), now.getMonth(), 1) },
    { id: "exp-2", description: "فاتورة كهرباء", amount: 800, category: "مرافق", date: new Date(now.getFullYear(), now.getMonth(), 5) },
    { id: "exp-3", description: "رواتب الموظفين", amount: 8000, category: "رواتب", date: new Date(now.getFullYear(), now.getMonth(), 1) },
  ];
}
