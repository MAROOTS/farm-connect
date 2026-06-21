import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import BottomNav from './BottomNav'
import GlobalSearchModal from './GlobalSearchModal'

const titles = {
    '/app/dashboard':   'Dashboard',
    '/app/marketplace': 'Marketplace',
    '/app/farm':        'My farm',
    '/app/advisory':    'Advisory',
    '/app/orders':      'Orders',
    '/app/admin':       'Admin panel',
}

export default function AppLayout() {
    const { pathname } = useLocation()
    const [searchOpen, setSearchOpen] = useState(false)
    const title = titles[pathname] ?? 'AgriConnect'

    // Cmd+K / Ctrl+K opens search from anywhere
    useEffect(() => {
        function handleKey(e) {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
            }
        }
        document.addEventListener('keydown', handleKey)
        return () => document.removeEventListener('keydown', handleKey)
    }, [])

    return (
        <div className="flex min-h-screen bg-[#f8f7f4] dark:bg-[#0f1a14]">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <Topbar
                    title={title}
                    onSearchClick={() => setSearchOpen(true)}
                />
                <main className="flex-1 p-4 sm:p-6 pb-24 lg:pb-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
            <BottomNav />

            <GlobalSearchModal
                isOpen={searchOpen}
                onClose={() => setSearchOpen(false)}
            />
        </div>
    )
}