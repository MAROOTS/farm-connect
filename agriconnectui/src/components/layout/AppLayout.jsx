import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const titles = {
  "/app/dashboard": "Dashboard",
  "/app/marketplace": "Marketplace",
  "/app/farm": "My farm",
  "/app/advisory": "Advisory",
  "/app/orders": "Orders",
};

export default function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "AgriConnect";

  return (
    <div className="flex min-h-screen bg-[#f8f7f4]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title={title} />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
