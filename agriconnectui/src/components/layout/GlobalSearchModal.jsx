import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    MagnifyingGlassIcon, HomeIcon, ShoppingCartIcon,
    GlobeAltIcon, CloudIcon, ClipboardDocumentListIcon,
    ShieldCheckIcon, ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { marketplaceApi } from "../../api/marketplace";
import { useAuthStore } from "../../store/authStore";

export default function GlobalSearchModal({ isOpen, onClose }) {
    const navigate = useNavigate();
    const user     = useAuthStore((s) => s.user);
    const inputRef = useRef(null);

    const [query, setQuery]       = useState("");
    const [listings, setListings] = useState([]);
    const [orders, setOrders]     = useState([]);
    const [loaded, setLoaded]     = useState(false);

    // Fetch data once when modal opens
    useEffect(() => {
        if (isOpen && !loaded) {
            Promise.allSettled([
                marketplaceApi.getListings(),
                marketplaceApi.getMyOrders(),
            ]).then(([listingsRes, ordersRes]) => {
                if (listingsRes.status === "fulfilled")
                    setListings(listingsRes.value.data.data ?? []);
                if (ordersRes.status === "fulfilled")
                    setOrders(ordersRes.value.data.data ?? []);
                setLoaded(true);
            });
        }
    }, [isOpen, loaded]);

    // Autofocus input + reset query when opened
    useEffect(() => {
        if (isOpen) {
            setQuery("");
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        function handleKey(e) {
            if (e.key === "Escape") onClose();
        }
        if (isOpen) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const navItems = [
        { label: "Dashboard",   to: "/app/dashboard",   icon: HomeIcon },
        { label: "Marketplace", to: "/app/marketplace", icon: ShoppingCartIcon },
        { label: "My farm",     to: "/app/farm",        icon: GlobeAltIcon },
        { label: "Advisory",    to: "/app/advisory",    icon: CloudIcon },
        { label: "Orders",      to: "/app/orders",
            icon: ClipboardDocumentListIcon },
        ...(user?.role === "ADMIN" ? [{
            label: "Admin panel", to: "/app/admin", icon: ShieldCheckIcon
        }] : []),
    ];

    const q = query.toLowerCase().trim();

    const matchedNav = navItems.filter((n) =>
        q === "" || n.label.toLowerCase().includes(q));

    const matchedListings = q === "" ? [] : listings.filter((l) =>
        l.title?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q) ||
        l.farmerName?.toLowerCase().includes(q)
    ).slice(0, 5);

    const matchedOrders = q === "" ? [] : orders.filter((o) =>
        o.id?.toLowerCase().includes(q) ||
        o.buyerPhone?.includes(q)
    ).slice(0, 5);

    function goTo(path) {
        navigate(path);
        onClose();
    }

    const noResults = q !== "" && matchedNav.length === 0 &&
        matchedListings.length === 0 && matchedOrders.length === 0;

    return (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start
                    justify-center pt-[10vh] px-4"
             onClick={onClose}>
            <div className="bg-white dark:bg-[#0d1f15] rounded-[16px]
                      border border-[#e5e7eb] dark:border-[#1a3d2b]
                      w-full max-w-lg max-h-[60vh] overflow-hidden
                      flex flex-col shadow-2xl"
                 onClick={(e) => e.stopPropagation()}>

                {/* Search input */}
                <div className="flex items-center gap-3 px-4 py-3.5
                        border-b border-[#e5e7eb] dark:border-[#1a3d2b]">
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 shrink-0" />
                    <input
                        ref={inputRef}
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search listings, orders, or jump to a page..."
                        className="flex-1 text-sm bg-transparent outline-none
                       text-gray-900 dark:text-gray-100
                       placeholder:text-gray-400"
                    />
                    <kbd className="text-[10px] text-gray-400 border
                          border-[#e5e7eb] dark:border-[#1a3d2b]
                          rounded-[4px] px-1.5 py-0.5">
                        Esc
                    </kbd>
                </div>

                {/* Results */}
                <div className="overflow-y-auto flex-1 py-2">

                    {noResults && (
                        <p className="px-4 py-8 text-center text-sm text-gray-400">
                            No results for "{query}"
                        </p>
                    )}

                    {/* Quick nav */}
                    {matchedNav.length > 0 && (
                        <div className="px-2 mb-2">
                            <p className="px-3 py-1 text-[11px] font-medium
                            text-gray-400 uppercase tracking-wider">
                                Pages
                            </p>
                            {matchedNav.map(({ label, to, icon: Icon }) => (
                                <button
                                    key={to}
                                    onClick={() => goTo(to)}
                                    className="w-full flex items-center gap-3 px-3 py-2
                             rounded-[8px] hover:bg-forest-50
                             dark:hover:bg-white/5 transition-colors
                             text-left"
                                >
                                    <Icon className="w-4 h-4 text-forest-600 shrink-0" />
                                    <span className="text-sm text-gray-700
                                   dark:text-gray-300">
                    {label}
                  </span>
                                    <ArrowRightIcon className="w-3 h-3 text-gray-300
                                             ml-auto" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Listings */}
                    {matchedListings.length > 0 && (
                        <div className="px-2 mb-2">
                            <p className="px-3 py-1 text-[11px] font-medium
                            text-gray-400 uppercase tracking-wider">
                                Listings
                            </p>
                            {matchedListings.map((l) => (
                                <button
                                    key={l.id}
                                    onClick={() => goTo(
                                        `/app/marketplace?search=${encodeURIComponent(l.title)}`
                                    )}
                                    className="w-full flex items-center gap-3 px-3 py-2
                             rounded-[8px] hover:bg-forest-50
                             dark:hover:bg-white/5 transition-colors
                             text-left"
                                >
                                    {l.imageUrls?.[0] || l.imageUrl ? (
                                        <img src={l.imageUrls?.[0] || l.imageUrl}
                                             className="w-7 h-7 rounded-[6px] object-cover
                                    shrink-0"  alt=""/>
                                    ) : (
                                        <ShoppingCartIcon className="w-4 h-4 text-amber-500
                                                 shrink-0" />
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-700
                                 dark:text-gray-300 truncate">
                                            {l.title}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            KES {l.pricePerUnit}/{l.unit} · {l.category}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Orders */}
                    {matchedOrders.length > 0 && (
                        <div className="px-2 mb-2">
                            <p className="px-3 py-1 text-[11px] font-medium
                            text-gray-400 uppercase tracking-wider">
                                Orders
                            </p>
                            {matchedOrders.map((o) => (
                                <button
                                    key={o.id}
                                    onClick={() => goTo("/app/orders")}
                                    className="w-full flex items-center gap-3 px-3 py-2
                             rounded-[8px] hover:bg-forest-50
                             dark:hover:bg-white/5 transition-colors
                             text-left"
                                >
                                    <ClipboardDocumentListIcon className="w-4 h-4
                                              text-purple-500 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm text-gray-700
                                 dark:text-gray-300">
                                            Order #{o.id.slice(0, 8).toUpperCase()}
                                        </p>
                                        <p className="text-[11px] text-gray-400">
                                            KES {o.totalAmount?.toLocaleString()} ·{" "}
                                            {o.status?.replace(/_/g, " ")}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {q === "" && (
                        <p className="px-4 py-2 text-[11px] text-gray-400">
                            Type to search listings and orders, or jump to a page above.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}