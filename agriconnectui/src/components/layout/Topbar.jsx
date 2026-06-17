import {
  BellIcon,
  MagnifyingGlassIcon,
  SunIcon,
  MoonIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../../store/authStore";
import { useThemeStore } from "../../store/themeStore";

export default function Topbar({ title }) {
  const user = useAuthStore((s) => s.user);
  const { isDark, toggleTheme } = useThemeStore();

  return (
    <header
      className="h-14 bg-white dark:bg-[#0d1f15]
                       border-b border-[#e5e7eb] dark:border-[#1a3d2b]
                       px-6 flex items-center justify-between
                       sticky top-0 z-10"
    >
      <h1
        className="text-[15px] font-semibold text-gray-900
                     dark:text-gray-100"
      >
        {title}
      </h1>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-[6px] text-gray-400
                           hover:bg-gray-100 dark:hover:bg-white/10
                           hover:text-gray-600 dark:hover:text-gray-300
                           transition-colors"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDark ? (
            <SunIcon className="w-4 h-4" />
          ) : (
            <MoonIcon className="w-4 h-4" />
          )}
        </button>
        <button
          className="p-1.5 rounded-[6px] text-gray-400
                           hover:bg-gray-100 dark:hover:bg-white/10
                           hover:text-gray-600 dark:hover:text-gray-300
                           transition-colors"
        >
          <MagnifyingGlassIcon className="w-4 h-4" />
        </button>
        <button
          className="p-1.5 rounded-[6px] text-gray-400
                           hover:bg-gray-100 dark:hover:bg-white/10
                           hover:text-gray-600 dark:hover:text-gray-300
                           transition-colors"
        >
          <BellIcon className="w-4 h-4" />
        </button>
        <div
          className="w-7 h-7 bg-forest-100 dark:bg-forest-900
                        rounded-full flex items-center justify-center
                        text-[11px] font-semibold text-forest-900
                        dark:text-forest-300"
        >
          {user?.fullName?.charAt(0) ?? "U"}
        </div>
      </div>
    </header>
  );
}
