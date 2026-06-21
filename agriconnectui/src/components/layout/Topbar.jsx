import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  MagnifyingGlassIcon, SunIcon, MoonIcon,
  ShieldCheckIcon, ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useThemeStore } from '../../store/themeStore'

export default function Topbar({ title, onSearchClick }) {
  const { user, logout } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
      <header className="h-14 bg-white dark:bg-[#0d1f15]
                       border-b border-[#e5e7eb] dark:border-[#1a3d2b]
                       px-4 sm:px-6 flex items-center justify-between
                       sticky top-0 z-30">
        <h1 className="text-[15px] font-semibold text-gray-900
                     dark:text-gray-100 truncate">
          {title}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
              onClick={toggleTheme}
              className="p-1.5 rounded-[6px] text-gray-400
                     hover:bg-gray-100 dark:hover:bg-white/10
                     hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
          >
            {isDark
                ? <SunIcon className="w-4 h-4" />
                : <MoonIcon className="w-4 h-4" />}
          </button>

          {/* Search — opens global search modal */}
          <button
              onClick={onSearchClick}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5
                     rounded-[6px] text-gray-400
                     hover:bg-gray-100 dark:hover:bg-white/10
                     hover:text-gray-600 dark:hover:text-gray-300
                     transition-colors"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            <kbd className="hidden sm:inline text-[10px] border
                          border-[#e5e7eb] dark:border-[#1a3d2b]
                          rounded-[4px] px-1.5 py-0.5">
              ⌘K
            </kbd>
          </button>

          {/* Bell icon removed */}

          {/* Avatar + dropdown */}
          <div className="relative" ref={menuRef}>
            <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-7 h-7 bg-forest-100 dark:bg-forest-900
                       rounded-full flex items-center justify-center
                       text-[11px] font-semibold text-forest-900
                       dark:text-forest-300 shrink-0"
            >
              {user?.fullName?.charAt(0) ?? 'U'}
            </button>

            {menuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56
                            bg-white dark:bg-[#0d1f15] rounded-[12px]
                            border border-[#e5e7eb] dark:border-[#1a3d2b]
                            shadow-lg z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#f0efec]
                              dark:border-[#1a3d2b]">
                    <p className="text-sm font-medium text-gray-800
                              dark:text-gray-200 truncate">
                      {user?.fullName}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user?.email}
                    </p>
                    <span className="inline-block mt-1.5 text-[10px]
                                 font-medium px-2 py-0.5 rounded-full
                                 bg-forest-100 dark:bg-forest-900
                                 text-forest-800 dark:text-forest-300">
                  {user?.role}
                </span>
                  </div>

                  {user?.role === 'ADMIN' && (
                      <Link
                          to="/app/admin"
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5
                             text-sm text-gray-600 dark:text-gray-300
                             hover:bg-gray-50 dark:hover:bg-white/5
                             transition-colors"
                      >
                        <ShieldCheckIcon className="w-4 h-4 text-red-500" />
                        Admin panel
                      </Link>
                  )}

                  <button
                      onClick={logout}
                      className="flex items-center gap-2.5 px-4 py-2.5
                           text-sm text-gray-600 dark:text-gray-300
                           hover:bg-gray-50 dark:hover:bg-white/5
                           transition-colors w-full text-left
                           border-t border-[#f0efec] dark:border-[#1a3d2b]"
                  >
                    <ArrowRightOnRectangleIcon className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
            )}
          </div>
        </div>
      </header>
  )
}