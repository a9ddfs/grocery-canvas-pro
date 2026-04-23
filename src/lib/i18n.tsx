import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export type Lang = "ar" | "en";

type Dict = Record<string, { ar: string; en: string }>;

export const translations: Dict = {
  // Brand & generic
  storeName: { ar: "بقالة السعادة", en: "Happiness Grocery" },
  posSystem: { ar: "نظام نقاط البيع", en: "Point of Sale System" },
  currency: { ar: "ر.س", en: "SAR" },
  pieces: { ar: "منتج", en: "items" },
  language: { ar: "English", en: "العربية" },

  // Navigation
  cashier: { ar: "الكاشير", en: "Cashier" },
  dashboard: { ar: "لوحة التحكم", en: "Dashboard" },
  inventory: { ar: "المخزون", en: "Inventory" },
  suppliers: { ar: "الموردين", en: "Suppliers" },
  customers: { ar: "العملاء", en: "Customers" },
  reports: { ar: "التقارير", en: "Reports" },
  cashbox: { ar: "الصندوق", en: "Cashbox" },
  coupons: { ar: "الكوبونات", en: "Coupons" },
  alerts: { ar: "تنبيهات", en: "Alerts" },

  // Cart
  cart: { ar: "السلة", en: "Cart" },
  emptyCart: { ar: "السلة فارغة", en: "Cart is empty" },
  subtotal: { ar: "المجموع الفرعي", en: "Subtotal" },
  vat: { ar: "ضريبة القيمة المضافة (15%)", en: "VAT (15%)" },
  total: { ar: "الإجمالي", en: "Total" },
  pay: { ar: "الدفع", en: "Pay" },
  choosePayment: { ar: "اختر طريقة الدفع", en: "Choose payment method" },
  cash: { ar: "نقدي", en: "Cash" },
  card: { ar: "بطاقة", en: "Card" },
  credit: { ar: "آجل", en: "Credit" },
  back: { ar: "رجوع", en: "Back" },
  creditSale: { ar: "البيع بالآجل", en: "Credit Sale" },
  selectCustomer: { ar: "اختر العميل", en: "Select customer" },
  confirmCredit: { ar: "تأكيد البيع بالآجل", en: "Confirm credit sale" },
  discount: { ar: "الخصم", en: "Discount" },
  coupon: { ar: "كوبون", en: "Coupon" },
  couponCode: { ar: "كود الكوبون", en: "Coupon code" },
  applyCoupon: { ar: "تطبيق", en: "Apply" },
  removeCoupon: { ar: "إزالة", en: "Remove" },
  invalidCoupon: { ar: "كود غير صحيح", en: "Invalid code" },
  couponApplied: { ar: "تم تطبيق الكوبون", en: "Coupon applied" },

  // Search
  searchPlaceholder: { ar: "بحث عن منتج أو باركود...", en: "Search product or barcode..." },
  noProducts: { ar: "لا توجد منتجات", en: "No products" },

  // Price modes
  priceType: { ar: "نوع السعر", en: "Price type" },
  retail: { ar: "تجزئة", en: "Retail" },
  wholesale: { ar: "جملة", en: "Wholesale" },

  // Categories
  catAll: { ar: "الكل", en: "All" },
  catFruits: { ar: "فواكه", en: "Fruits" },
  catVegetables: { ar: "خضروات", en: "Vegetables" },
  catDairy: { ar: "ألبان", en: "Dairy" },
  catBakery: { ar: "مخبوزات", en: "Bakery" },
  catDrinks: { ar: "مشروبات", en: "Drinks" },
  catCanned: { ar: "معلبات", en: "Canned" },

  // Units
  unitPiece: { ar: "حبة", en: "piece" },
  unitKg: { ar: "كيلو", en: "kg" },
  unitCarton: { ar: "كرتون", en: "carton" },
  unitPack: { ar: "عبوة", en: "pack" },

  // Stock
  outOfStock: { ar: "نفذت الكمية", en: "Out of stock" },
  outOfStockShort: { ar: "نفذ", en: "Out" },
  lowStock: { ar: "منخفض", en: "Low" },
  available: { ar: "متوفر", en: "In stock" },
  stockManagement: { ar: "إدارة المخزون", en: "Inventory Management" },
  allProducts: { ar: "جميع المنتجات", en: "All products" },
  lowStockOnly: { ar: "مخزون منخفض", en: "Low stock" },
  product: { ar: "المنتج", en: "Product" },
  barcode: { ar: "الباركود", en: "Barcode" },
  unit: { ar: "الوحدة", en: "Unit" },
  cost: { ar: "التكلفة", en: "Cost" },
  qty: { ar: "الكمية", en: "Qty" },
  minStock: { ar: "الحد الأدنى", en: "Min Stock" },
  status: { ar: "الحالة", en: "Status" },
  action: { ar: "إجراء", en: "Action" },

  // Receipt
  invoice: { ar: "الفاتورة", en: "Invoice" },
  simplifiedTax: { ar: "فاتورة ضريبية مبسطة", en: "Simplified Tax Invoice" },
  invoiceNumber: { ar: "رقم الفاتورة", en: "Invoice #" },
  date: { ar: "التاريخ", en: "Date" },
  time: { ar: "الوقت", en: "Time" },
  paymentMethod: { ar: "طريقة الدفع", en: "Payment method" },
  printInvoice: { ar: "طباعة الفاتورة", en: "Print Invoice" },
  close: { ar: "إغلاق", en: "Close" },
  thankYou: { ar: "شكراً لتسوقكم معنا!", en: "Thank you for shopping with us!" },
  goodDay: { ar: "نتمنى لكم يوماً سعيداً", en: "Have a wonderful day" },
  price: { ar: "السعر", en: "Price" },
  amount: { ar: "المبلغ", en: "Amount" },

  // Dashboard
  todaySales: { ar: "مبيعات اليوم", en: "Today's Sales" },
  todayOrders: { ar: "طلبات اليوم", en: "Today's Orders" },
  todayItemsSold: { ar: "منتجات مباعة اليوم", en: "Items Sold Today" },
  lowStockCount: { ar: "مخزون منخفض", en: "Low Stock" },
  weeklySales: { ar: "المبيعات الأسبوعية", en: "Weekly Sales" },
  dailyOrders: { ar: "الطلبات اليومية", en: "Daily Orders" },
  salesByCategory: { ar: "المبيعات حسب التصنيف", en: "Sales by Category" },
  paymentMethods: { ar: "طرق الدفع", en: "Payment Methods" },
  recentSales: { ar: "آخر المبيعات", en: "Recent Sales" },
  revenue: { ar: "الإيرادات", en: "Revenue" },
  orders: { ar: "الطلبات", en: "Orders" },

  // Suppliers
  suppliersTitle: { ar: "إدارة الموردين والمشتريات", en: "Suppliers & Purchases" },
  addSupplier: { ar: "إضافة مورد", en: "Add Supplier" },
  editSupplier: { ar: "تعديل المورد", en: "Edit Supplier" },
  newSupplier: { ar: "إضافة مورد جديد", en: "Add New Supplier" },
  purchaseOp: { ar: "عملية شراء", en: "New Purchase" },
  recordPurchase: { ar: "تسجيل عملية شراء", en: "Record Purchase" },
  supplierName: { ar: "اسم المورد", en: "Supplier name" },
  phone: { ar: "رقم الهاتف", en: "Phone" },
  address: { ar: "العنوان", en: "Address" },
  notes: { ar: "ملاحظات", en: "Notes" },
  saveChanges: { ar: "حفظ التعديلات", en: "Save Changes" },
  add: { ar: "إضافة", en: "Add" },
  save: { ar: "حفظ", en: "Save" },
  recentPurchases: { ar: "آخر عمليات الشراء", en: "Recent Purchases" },
  selectSupplier: { ar: "اختر المورد", en: "Select supplier" },
  selectProduct: { ar: "اختر المنتج", en: "Select product" },
  purchasePrice: { ar: "سعر الشراء", en: "Purchase Price" },
  addItem: { ar: "+ إضافة منتج آخر", en: "+ Add another item" },
  confirmPurchase: { ar: "تأكيد الشراء", en: "Confirm Purchase" },
  delete: { ar: "حذف", en: "Delete" },
  purchasesCount: { ar: "المشتريات", en: "Purchases" },
  totalLabel: { ar: "الإجمالي", en: "Total" },
  operationCount: { ar: "عملية", en: "ops" },

  // Customers
  customersTitle: { ar: "إدارة العملاء والديون", en: "Customers & Debts" },
  addCustomer: { ar: "إضافة عميل", en: "Add Customer" },
  newCustomer: { ar: "إضافة عميل جديد", en: "Add New Customer" },
  editCustomer: { ar: "تعديل العميل", en: "Edit Customer" },
  customerName: { ar: "اسم العميل", en: "Customer name" },
  customers_count: { ar: "العملاء", en: "Customers" },
  debts: { ar: "الديون", en: "Debts" },
  noDebts: { ar: "لا توجد ديون", en: "No debts" },
  paid: { ar: "مسدد", en: "Paid" },
  partial: { ar: "جزئي", en: "Partial" },
  pending: { ar: "معلق", en: "Pending" },
  dueDate: { ar: "الاستحقاق", en: "Due" },
  paidLbl: { ar: "المدفوع", en: "Paid" },
  remaining: { ar: "المتبقي", en: "Remaining" },
  payDebt: { ar: "تسديد", en: "Pay" },
  payDebtTitle: { ar: "تسديد دين", en: "Pay Debt" },
  confirmPay: { ar: "تأكيد الدفع", en: "Confirm Payment" },
  payment: { ar: "دفعة", en: "Payment" },
  purchaseHistory: { ar: "سجل المشتريات", en: "Purchase History" },
  noPurchases: { ar: "لا توجد مشتريات", en: "No purchases" },
  selectCustomerView: { ar: "اختر عميلاً لعرض التفاصيل", en: "Select a customer to view details" },
  debtsLbl: { ar: "ديون", en: "Debts" },

  // Reports
  reportsTitle: { ar: "التقارير المتقدمة", en: "Advanced Reports" },
  tabSales: { ar: "المبيعات", en: "Sales" },
  tabProducts: { ar: "المنتجات", en: "Products" },
  tabProfits: { ar: "الأرباح", en: "Profits" },
  tabInventory: { ar: "المخزون", en: "Inventory" },
  tabDebts: { ar: "الديون", en: "Debts" },
  totalSales: { ar: "إجمالي المبيعات", en: "Total Sales" },
  ordersCount: { ar: "عدد الطلبات", en: "Order Count" },
  avgOrder: { ar: "متوسط الطلب", en: "Avg. Order" },
  dailySales7: { ar: "المبيعات اليومية (آخر 7 أيام)", en: "Daily Sales (last 7 days)" },
  bestSelling: { ar: "أفضل المنتجات مبيعاً", en: "Best Selling Products" },
  worstSelling: { ar: "أقل المنتجات حركة", en: "Slowest Moving Products" },
  qtySold: { ar: "الكمية المباعة", en: "Quantity Sold" },
  totalRevenue: { ar: "إجمالي الإيرادات", en: "Total Revenue" },
  costOfGoods: { ar: "تكلفة البضاعة", en: "Cost of Goods" },
  expenses: { ar: "المصاريف", en: "Expenses" },
  netProfit: { ar: "صافي الربح", en: "Net Profit" },
  dailyProfits: { ar: "الأرباح اليومية", en: "Daily Profits" },
  profit: { ar: "الربح", en: "Profit" },
  expensesDetails: { ar: "تفاصيل المصاريف", en: "Expense Details" },
  inventoryReport: { ar: "تقرير المخزون الحالي", en: "Current Inventory Report" },
  retailPrice: { ar: "سعر التجزئة", en: "Retail Price" },
  wholesalePrice: { ar: "سعر الجملة", en: "Wholesale Price" },
  inventoryValue: { ar: "قيمة المخزون", en: "Inventory Value" },
  totalDebts: { ar: "إجمالي الديون", en: "Total Debts" },
  overdueDebts: { ar: "ديون متأخرة", en: "Overdue Debts" },
  debtorCustomers: { ar: "عملاء مدينون", en: "Debtor Customers" },
  debtsByCustomer: { ar: "تفاصيل الديون حسب العميل", en: "Debts by Customer" },
  invoiceShort: { ar: "فاتورة", en: "Invoice" },

  // Cashbox
  cashboxTitle: { ar: "الصندوق", en: "Cashbox" },
  expense: { ar: "مصروف", en: "Expense" },
  depositWithdrawal: { ar: "إيداع / سحب", en: "Deposit / Withdrawal" },
  cashboxBalance: { ar: "رصيد الصندوق", en: "Cashbox Balance" },
  totalIn: { ar: "إجمالي الواردات", en: "Total Inflow" },
  totalOut: { ar: "إجمالي الصادرات", en: "Total Outflow" },
  transactionLog: { ar: "سجل الحركات", en: "Transaction Log" },
  noTransactions: { ar: "لا توجد حركات بعد", en: "No transactions yet" },
  deposit: { ar: "إيداع", en: "Deposit" },
  withdrawal: { ar: "سحب", en: "Withdrawal" },
  description: { ar: "الوصف", en: "Description" },
  confirm: { ar: "تأكيد", en: "Confirm" },
  recordExpense: { ar: "تسجيل مصروف", en: "Record Expense" },
  expenseDesc: { ar: "وصف المصروف", en: "Expense description" },
  catRent: { ar: "إيجار", en: "Rent" },
  catSalaries: { ar: "رواتب", en: "Salaries" },
  catUtilities: { ar: "مرافق (كهرباء/ماء)", en: "Utilities (water/electricity)" },
  catMaintenance: { ar: "صيانة", en: "Maintenance" },
  catTransport: { ar: "نقل", en: "Transport" },
  catOther: { ar: "أخرى", en: "Other" },
  saleType: { ar: "بيع", en: "Sale" },
  purchaseType: { ar: "شراء", en: "Purchase" },
  expenseType: { ar: "مصروف", en: "Expense" },
  debtPaymentType: { ar: "سداد دين", en: "Debt Payment" },

  // Coupons page
  couponsTitle: { ar: "إدارة الكوبونات والخصومات", en: "Coupons & Discounts" },
  addCoupon: { ar: "إضافة كوبون", en: "Add Coupon" },
  editCoupon: { ar: "تعديل الكوبون", en: "Edit Coupon" },
  newCoupon: { ar: "كوبون جديد", en: "New Coupon" },
  couponCodeField: { ar: "كود الكوبون (مثل: SUMMER20)", en: "Coupon code (e.g. SUMMER20)" },
  couponType: { ar: "نوع الخصم", en: "Discount Type" },
  percentage: { ar: "نسبة %", en: "Percentage %" },
  fixedAmount: { ar: "مبلغ ثابت", en: "Fixed Amount" },
  discountValue: { ar: "قيمة الخصم", en: "Discount Value" },
  minPurchase: { ar: "الحد الأدنى للشراء", en: "Minimum Purchase" },
  maxUses: { ar: "أقصى عدد استخدامات (0 = غير محدود)", en: "Max Uses (0 = unlimited)" },
  expiryDate: { ar: "تاريخ الانتهاء (اختياري)", en: "Expiry Date (optional)" },
  active: { ar: "نشط", en: "Active" },
  inactive: { ar: "غير نشط", en: "Inactive" },
  expired: { ar: "منتهي", en: "Expired" },
  used: { ar: "مستخدم", en: "Used" },
  uses: { ar: "الاستخدامات", en: "Uses" },
  unlimited: { ar: "غير محدود", en: "Unlimited" },
  noCoupons: { ar: "لا توجد كوبونات. أضف كوبون لتفعيل الخصومات.", en: "No coupons yet. Add a coupon to enable discounts." },
  couponMinNotMet: { ar: "الحد الأدنى للشراء غير مستوفى", en: "Minimum purchase not met" },
  couponExpired: { ar: "الكوبون منتهي", en: "Coupon expired" },
  couponMaxedOut: { ar: "تم استنفاد استخدامات الكوبون", en: "Coupon max uses reached" },
  couponInactive: { ar: "الكوبون غير نشط", en: "Coupon inactive" },

  // Alerts
  noAlerts: { ar: "لا توجد تنبيهات", en: "No alerts" },
  outOfStockMsg: { ar: "نفذ من المخزون!", en: "is out of stock!" },
  remainingQty: { ar: "الكمية المتبقية", en: "remaining" },
  minLevel: { ar: "الحد الأدنى", en: "min" },
  overdueDebtMsg: { ar: "دين متأخر", en: "Overdue debt" },
  showAll: { ar: "عرض الكل", en: "View all" },

  // Misc
  saleByCash: { ar: "بيع نقدي", en: "Cash sale" },
  saleByCard: { ar: "بيع ببطاقة", en: "Card sale" },
  saleByCredit: { ar: "بيع آجل", en: "Credit sale" },
  bySupplier: { ar: "شراء من", en: "Purchased from" },
  supplierGeneric: { ar: "مورد", en: "supplier" },
  customerGeneric: { ar: "عميل", en: "customer" },
};

export const productNames: Record<string, { ar: string; en: string }> = {
  "1": { ar: "تفاح أحمر", en: "Red Apples" },
  "2": { ar: "موز", en: "Bananas" },
  "3": { ar: "برتقال", en: "Oranges" },
  "4": { ar: "فراولة", en: "Strawberries" },
  "5": { ar: "طماطم", en: "Tomatoes" },
  "6": { ar: "خيار", en: "Cucumbers" },
  "7": { ar: "فلفل", en: "Bell Peppers" },
  "8": { ar: "بطاطس", en: "Potatoes" },
  "9": { ar: "بصل", en: "Onions" },
  "10": { ar: "حليب طازج", en: "Fresh Milk" },
  "11": { ar: "جبنة", en: "Cheese" },
  "12": { ar: "بيض", en: "Eggs" },
  "13": { ar: "زبادي", en: "Yogurt" },
  "14": { ar: "زبدة", en: "Butter" },
  "15": { ar: "خبز أبيض", en: "White Bread" },
  "16": { ar: "كرواسون", en: "Croissants" },
  "17": { ar: "عصير برتقال", en: "Orange Juice" },
  "18": { ar: "مياه معدنية", en: "Mineral Water" },
  "19": { ar: "كولا", en: "Cola" },
  "20": { ar: "تونة معلبة", en: "Canned Tuna" },
  "21": { ar: "فاصوليا معلبة", en: "Canned Beans" },
  "22": { ar: "أرز", en: "Rice" },
};

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof translations) => string;
  pn: (id: string, fallback?: string) => string;
  dir: "rtl" | "ltr";
  fmt: (n: number, digits?: number) => string;
  fmtMoney: (n: number) => string;
  locale: string;
}

const I18nContext = createContext<I18nCtx | null>(null);

export const I18nProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("pos-lang");
    return saved === "en" ? "en" : "ar";
  });

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("pos-lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  const t = (key: keyof typeof translations) => {
    const entry = translations[key];
    if (!entry) return String(key);
    return entry[lang];
  };

  const pn = (id: string, fallback?: string) => {
    const entry = productNames[id];
    if (entry) return entry[lang];
    return fallback || id;
  };

  const locale = lang === "ar" ? "ar-SA" : "en-US";

  const fmt = (n: number, digits = 2) => {
    return new Intl.NumberFormat(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);
  };

  const fmtMoney = (n: number) => `${fmt(n)} ${t("currency")}`;

  return (
    <I18nContext.Provider value={{ lang, setLang, t, pn, dir: lang === "ar" ? "rtl" : "ltr", fmt, fmtMoney, locale }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
