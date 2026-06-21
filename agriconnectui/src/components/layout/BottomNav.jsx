import { NavLink, useLocation } from 'react-router-dom'
import {
  HomeIcon, ShoppingCartIcon, GlobeAltIcon,
  ClipboardDocumentListIcon, CloudIcon,
} from '@heroicons/react/24/outline'
import {
  HomeIcon as HomeSolid, ShoppingCartIcon as ShoppingCartSolid,
  GlobeAltIcon as GlobeAltSolid,
  ClipboardDocumentListIcon as ClipboardSolid,
  CloudIcon as CloudSolid,
} from '@heroicons/react/24/solid'
import clsx from 'clsx'

const items = [
  { to: '/app/dashboard',   label: 'Home',
    icon: HomeIcon, active: HomeSolid },
  { to: '/app/marketplace', label: 'Market',
    icon: ShoppingCartIcon, active: ShoppingCartSolid },
  { to: '/app/farm',        label: 'Farm',
    icon: GlobeAltIcon, active: GlobeAltSolid },
  { to: '/app/advisory',    label: 'Weather',
    icon: CloudIcon, active: CloudSolid },
  { to: '/app/orders',      label: 'Orders',
    icon: ClipboardDocumentListIcon, active: ClipboardSolid },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40
                    px-3 pb-[max(env(safe-area-inset-bottom),12px)]
                    pt-2">
        <div className="bg-white/90 dark:bg-[#0d1f15]/90
                      backdrop-blur-xl
                      border border-[#e5e7eb] dark:border-[#1a3d2b]
                      rounded-[20px] shadow-[0_4px_24px_rgba(0,0,0,0.08)]
                      dark:shadow-[0_4px_24px_rgba(0,0,0,0.4)]
                      flex items-center justify-around px-1 py-1.5">
          {items.map(({ to, label, icon: Icon, active: Active }) => {
            const isActive = pathname === to
            const IconComp = isActive ? Active : Icon
            return (
                <NavLink
                    key={to}
                    to={to}
                    className="relative flex-1 flex flex-col items-center
                         justify-center gap-0.5 py-1.5 group"
                >
                  {/* Active pill background */}
                  <div className={clsx(
                      "absolute inset-x-2 inset-y-0.5 rounded-[14px]",
                      "transition-all duration-300",
                      isActive
                          ? "bg-forest-100 dark:bg-forest-900/50 scale-100 opacity-100"
                          : "scale-75 opacity-0"
                  )} />

                  <IconComp className={clsx(
                      "relative w-[22px] h-[22px] transition-all duration-200",
                      "group-active:scale-90",
                      isActive
                          ? "text-forest-700 dark:text-forest-300 -translate-y-0.5"
                          : "text-gray-400 dark:text-gray-500"
                  )} />

                  <span className={clsx(
                      "relative text-[10px] font-medium transition-all",
                      "duration-200 leading-none",
                      isActive
                          ? "text-forest-700 dark:text-forest-300 opacity-100 h-3"
                          : "text-gray-400 opacity-0 h-0"
                  )}>
                {label}
              </span>

                  {/* Active dot indicator */}
                  {isActive && (
                      <span className="absolute -top-0.5 w-1 h-1
                                 rounded-full bg-forest-600
                                 dark:bg-forest-400" />
                  )}
                </NavLink>
            )
          })}
        </div>
      </nav>
  )
}