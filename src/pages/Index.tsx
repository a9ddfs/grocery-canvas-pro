import { useState } from "react";
import POSScreen from "@/components/pos/POSScreen";
import Dashboard from "@/components/pos/Dashboard";
import InventoryPage from "@/components/pos/InventoryPage";

const Index = () => {
  const [page, setPage] = useState("pos");

  if (page === "dashboard") return <Dashboard onNavigate={setPage} />;
  if (page === "inventory") return <InventoryPage onNavigate={setPage} />;
  return <POSScreen onNavigate={setPage} />;
};

export default Index;
