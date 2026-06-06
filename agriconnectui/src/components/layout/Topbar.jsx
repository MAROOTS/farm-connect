import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";

export default function Topbar({ title }) {
  const user = useAuthStore((s) => s.user);

  return (
    <header
      className="h-14 bg-white border-b border-[#e5e7eb] px-6
                       flex items-center justify-between sticky top-0 z-10"
    >
      <h1 className="text-[15px] font-semibold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        <button
          className="p-1.5 rounded-[6px] text-gray-400
                           hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded-[6px] text-gray-400
                           hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <BellIcon className="w-4 h-4" />
        </button>
        <div
          className="w-7 h-7 bg-forest-100 rounded-full flex items-center
                        justify-center text-[11px] font-semibold text-forest-900"
        >
          {user?.fullName?.charAt(0) ?? "U"}
        </div>
      </div>
    </header>
  );
}
