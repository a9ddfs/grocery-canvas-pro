// Extended types for the full grocery system

export type Supplier = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: Date;
};

export type PurchaseOrder = {
  id: string;
  supplierId: string;
  items: PurchaseItem[];
  total: number;
  date: Date;
  notes: string;
};

export type PurchaseItem = {
  productId: string;
  productName: string;
  quantity: number;
  costPrice: number; // سعر الشراء
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: Date;
};

export type Debt = {
  id: string;
  customerId: string;
  saleId: string;
  amount: number;
  paidAmount: number;
  dueDate: Date;
  createdAt: Date;
  status: "pending" | "partial" | "paid";
  payments: DebtPayment[];
};

export type DebtPayment = {
  id: string;
  amount: number;
  date: Date;
  notes: string;
};

export type Expense = {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: Date;
};

export type CashboxEntry = {
  id: string;
  type: "sale" | "purchase" | "expense" | "debt_payment" | "deposit" | "withdrawal";
  amount: number;
  description: string;
  date: Date;
  referenceId?: string;
};

export type Alert = {
  id: string;
  type: "low_stock" | "out_of_stock" | "overdue_debt" | "low_profit";
  message: string;
  severity: "warning" | "critical";
  date: Date;
  dismissed: boolean;
  referenceId?: string;
};
