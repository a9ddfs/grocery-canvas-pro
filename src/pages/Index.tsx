import { useState } from "react";
import POSScreen from "@/components/pos/POSScreen";
import Dashboard from "@/components/pos/Dashboard";
import InventoryPage from "@/components/pos/InventoryPage";
import SuppliersPage from "@/components/pos/SuppliersPage";
import CustomersPage from "@/components/pos/CustomersPage";
import ReportsPage from "@/components/pos/ReportsPage";
import CashboxPage from "@/components/pos/CashboxPage";
import CouponsPage from "@/components/pos/CouponsPage";

const Index = () => {
  const [page, setPage] = useState("pos");

  switch (page) {
    case "dashboard": return <Dashboard onNavigate={setPage} />;
    case "inventory": return <InventoryPage onNavigate={setPage} />;
    case "suppliers": return <SuppliersPage onNavigate={setPage} />;
    case "customers": return <CustomersPage onNavigate={setPage} />;
    case "reports": return <ReportsPage onNavigate={setPage} />;
    case "cashbox": return <CashboxPage onNavigate={setPage} />;
    case "coupons": return <CouponsPage onNavigate={setPage} />;
    default: return <POSScreen onNavigate={setPage} />;
  }
};

export default Index;
