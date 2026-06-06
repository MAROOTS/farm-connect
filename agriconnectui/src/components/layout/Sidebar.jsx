import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  CloudIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";
import clsx from "clsx";

const nav = [
  { label: "Dashboard", to: "/app/dashboard", icon: HomeIcon },
  { label: "Marketplace", to: "/app/marketplace", icon: ShoppingCartIcon },
  { label: "My farm", to: "/app/farm", icon: GlobeAltIcon },
  { label: "Advisory", to: "/app/advisory", icon: CloudIcon },
  { label: "Orders", to: "/app/orders", icon: ClipboardDocumentListIcon },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();

  return (
    <aside
      className="w-56 shrink-0 h-screen bg-white border-r border-[#e5e7eb]
                      flex flex-col sticky top-0"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-[#e5e7eb]">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 bg-forest-900 rounded-[6px] flex items-center
                          justify-center"
          >
            <GlobeAltIcon className="w-4 h-4 text-white" />
          </div>
          <span className="text-[15px] font-semibold text-forest-900 tracking-tight">
            AgriConnect
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {nav.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm transition-colors",
                isActive
                  ? "bg-forest-100 text-forest-900 font-medium"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800",
              )
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 py-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2.5 px-3 py-2 mb-1">
          <div
            className="w-7 h-7 bg-forest-100 rounded-full flex items-center
                          justify-center text-[11px] font-semibold text-forest-900"
          >
            {user?.fullName?.charAt(0) ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-800 truncate">
              {user?.fullName ?? "Farmer"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-[8px] text-sm
                     text-gray-500 hover:bg-gray-50 hover:text-gray-800
                     transition-colors w-full"
        >
          <ArrowRightOnRectangleIcon className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
