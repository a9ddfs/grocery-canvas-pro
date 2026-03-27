import { create } from "zustand";
import { Product, CartItem, SaleRecord, initialProducts } from "@/data/products";

interface StoreState {
  products: Product[];
  cart: CartItem[];
  sales: SaleRecord[];
  
  // Cart actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: () => number;
  cartItemCount: () => number;

  // Sales actions
  completeSale: (paymentMethod: "cash" | "card") => SaleRecord | null;

  // Inventory actions
  updateStock: (productId: string, newStock: number) => void;
  getLowStockProducts: () => Product[];
}

export const useStore = create<StoreState>((set, get) => ({
  products: initialProducts,
  cart: [],
  sales: generateMockSales(),

  addToCart: (product) => {
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
      return { cart: [...state.cart, { ...product, quantity: 1 }] };
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
    return get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },

  cartItemCount: () => {
    return get().cart.reduce((sum, item) => sum + item.quantity, 0);
  },

  completeSale: (paymentMethod) => {
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
      date: new Date(),
    };

    // Update stock
    const updatedProducts = state.products.map((p) => {
      const cartItem = state.cart.find((c) => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: Math.max(0, p.stock - cartItem.quantity) };
      }
      return p;
    });

    set({
      sales: [sale, ...state.sales],
      cart: [],
      products: updatedProducts,
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
    return get().products.filter((p) => p.stock <= 10);
  },
}));

// Generate mock sales data for the last 7 days
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
        items.push({ ...product, quantity: qty });
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
