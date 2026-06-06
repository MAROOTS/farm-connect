import { useState, useEffect } from "react";
import {
  ShoppingCartIcon,
  GlobeAltIcon,
  CloudIcon,
  ClipboardDocumentListIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/outline";
import { useAuthStore } from "../store/authStore";
import { marketplaceApi } from "../api/marketplace";
import { farmApi } from "../api/farm";
import { Link } from "react-router-dom";
import clsx from "clsx";

function StatCard({ label, value, icon: Icon, sub }) {
  return (
    <div className="bg-[#f8f7f4] rounded-[10px] p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-gray-500">{label}</p>
        {Icon && (
          <div
            className="w-7 h-7 bg-white rounded-[6px] border
                          border-[#e5e7eb] flex items-center justify-center"
          >
            <Icon className="w-3.5 h-3.5 text-forest-600" />
          </div>
        )}
      </div>
      <p className="text-2xl font-semibold text-forest-900">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function Badge({ status }) {
  const map = {
    ACTIVE: "bg-forest-100 text-forest-800",
    SOLD_OUT: "bg-gray-100 text-gray-500",
    PAUSED: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-forest-100 text-forest-800",
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    CANCELLED: "bg-red-100 text-red-700",
    PLANTED: "bg-blue-100 text-blue-700",
    GROWING: "bg-forest-100 text-forest-800",
    HARVESTED: "bg-gray-100 text-gray-500",
  };
  const label = status
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={clsx(
        "inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full",
        map[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {label}
    </span>
  );
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const results = await Promise.allSettled([
          marketplaceApi.getMyListings(),
          marketplaceApi.getMyOrders(),
          farmApi.getMyCrops(),
          farmApi.getMyTasks(),
          farmApi.getOverdue(),
        ]);
        if (results[0].status === "fulfilled")
          setListings(results[0].value.data.data ?? []);
        if (results[1].status === "fulfilled")
          setOrders(results[1].value.data.data ?? []);
        if (results[2].status === "fulfilled")
          setCrops(results[2].value.data.data ?? []);
        if (results[3].status === "fulfilled")
          setTasks(results[3].value.data.data ?? []);
        if (results[4].status === "fulfilled")
          setOverdue(results[4].value.data.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeListings = listings.filter((l) => l.status === "ACTIVE");
  const pendingOrders = orders.filter((o) => o.status === "PENDING_PAYMENT");
  const activeCrops = crops.filter(
    (c) => c.status === "GROWING" || c.status === "PLANTED",
  );

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex flex-col gap-6">
      {/*Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {greeting}, {user?.fullName?.split(" ")[0]} 👋
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Here's what's happening on your farm today.
          </p>
        </div>
        <Link
          to="/app/marketplace"
          className="inline-flex items-center gap-2 bg-forest-900
                     text-white text-xs font-medium px-3 py-2
                     rounded-[8px] hover:bg-forest-800 transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          New listing
        </Link>
      </div>

      {/*Stat cards*/}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Active listings"
          value={loading ? "—" : activeListings.length}
          icon={ShoppingCartIcon}
          sub={`${listings.length} total`}
        />
        <StatCard
          label="Pending orders"
          value={loading ? "—" : pendingOrders.length}
          icon={ClipboardDocumentListIcon}
          sub={`${orders.length} total orders`}
        />
        <StatCard
          label="Active crops"
          value={loading ? "—" : activeCrops.length}
          icon={GlobeAltIcon}
          sub={`${crops.length} crops tracked`}
        />
        <StatCard
          label="Overdue tasks"
          value={loading ? "—" : overdue.length}
          icon={ExclamationTriangleIcon}
          sub={`${tasks.length} tasks total`}
        />
      </div>

      {/*Overdue alert */}
      {!loading && overdue.length > 0 && (
        <div
          className="flex items-start gap-3 bg-amber-50 border
                        border-amber-200 rounded-[10px] px-4 py-3"
        >
          <ExclamationTriangleIcon
            className="w-4 h-4 text-amber-600
                                              shrink-0 mt-0.5"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-800">
              You have {overdue.length} overdue task
              {overdue.length > 1 ? "s" : ""}
            </p>
            <p className="text-xs text-amber-600 mt-0.5">
              {overdue
                .slice(0, 2)
                .map((t) => t.title)
                .join(", ")}
              {overdue.length > 2 && ` and ${overdue.length - 2} more`}
            </p>
          </div>
          <Link
            to="/app/farm"
            className="text-xs text-amber-700 font-medium
                           hover:text-amber-900 shrink-0"
          >
            View →
          </Link>
        </div>
      )}

      {/*Main grid*/}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent listings */}
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          <div
            className="px-4 py-3 border-b border-[#e5e7eb]
                          flex items-center justify-between"
          >
            <p className="text-sm font-semibold text-gray-800">
              Recent listings
            </p>
            <Link
              to="/app/marketplace"
              className="text-xs text-forest-700 font-medium
                             hover:text-forest-900 flex items-center gap-1"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : listings.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <ShoppingCartIcon
                className="w-8 h-8 text-gray-300
                                           mx-auto mb-2"
              />
              <p className="text-sm text-gray-400 mb-3">No listings yet</p>
              <Link
                to="/app/marketplace"
                className="text-xs text-forest-700 font-medium
                               hover:underline"
              >
                Create your first listing →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f0efec]">
              {listings.slice(0, 5).map((l) => (
                <div
                  key={l.id}
                  className="flex items-center justify-between
                                px-4 py-3"
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium text-gray-800
                                  truncate"
                    >
                      {l.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      KES {l.pricePerUnit}/{l.unit} · {l.quantityAvailable}{" "}
                      {l.unit} available
                    </p>
                  </div>
                  <Badge status={l.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          <div
            className="px-4 py-3 border-b border-[#e5e7eb]
                          flex items-center justify-between"
          >
            <p className="text-sm font-semibold text-gray-800">Recent orders</p>
            <Link
              to="/app/orders"
              className="text-xs text-forest-700 font-medium
                             hover:text-forest-900 flex items-center gap-1"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <ClipboardDocumentListIcon
                className="w-8 h-8 text-gray-300
                                                    mx-auto mb-2"
              />
              <p className="text-sm text-gray-400 mb-3">No orders yet</p>
              <Link
                to="/app/marketplace"
                className="text-xs text-forest-700 font-medium
                               hover:underline"
              >
                Browse marketplace →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f0efec]">
              {orders.slice(0, 5).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between
                                px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      Order #{o.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      KES {o.totalAmount?.toLocaleString()} · {o.quantity} units
                    </p>
                  </div>
                  <Badge status={o.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active crops */}
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          <div
            className="px-4 py-3 border-b border-[#e5e7eb]
                          flex items-center justify-between"
          >
            <p className="text-sm font-semibold text-gray-800">Active crops</p>
            <Link
              to="/app/farm"
              className="text-xs text-forest-700 font-medium
                             hover:text-forest-900 flex items-center gap-1"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : activeCrops.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <GlobeAltIcon
                className="w-8 h-8 text-gray-300
                                       mx-auto mb-2"
              />
              <p className="text-sm text-gray-400 mb-3">No active crops</p>
              <Link
                to="/app/farm"
                className="text-xs text-forest-700 font-medium
                               hover:underline"
              >
                Add your first crop →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f0efec]">
              {activeCrops.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between
                                px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800">
                      {c.cropName}
                      {c.variety && (
                        <span className="text-gray-400 font-normal">
                          {" "}
                          · {c.variety}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {c.plantedAreaAcres} acres · Planted{" "}
                      {new Date(c.plantingDate).toLocaleDateString("en-KE", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                  <Badge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming tasks */}
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          <div
            className="px-4 py-3 border-b border-[#e5e7eb]
                          flex items-center justify-between"
          >
            <p className="text-sm font-semibold text-gray-800">
              Upcoming tasks
            </p>
            <Link
              to="/app/farm"
              className="text-xs text-forest-700 font-medium
                             hover:text-forest-900 flex items-center gap-1"
            >
              View all
              <ArrowRightIcon className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-400">Loading...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="px-4 py-8 text-center">
              <ClipboardDocumentListIcon
                className="w-8 h-8 text-gray-300
                                                    mx-auto mb-2"
              />
              <p className="text-sm text-gray-400 mb-3">No tasks yet</p>
              <Link
                to="/app/farm"
                className="text-xs text-forest-700 font-medium
                               hover:underline"
              >
                Add a farm task →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#f0efec]">
              {tasks
                .filter((t) => t.status !== "COMPLETED")
                .slice(0, 5)
                .map((t) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between
                                px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p
                        className="text-sm font-medium text-gray-800
                                  truncate"
                      >
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Due{" "}
                        {new Date(t.dueDate).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        · {t.priority?.toLowerCase()} priority
                      </p>
                    </div>
                    <Badge status={t.status} />
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/*Quick links*/}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Check advisory",
            desc: "Today's weather tips",
            to: "/app/advisory",
            icon: CloudIcon,
          },
          {
            label: "Browse marketplace",
            desc: "See active listings",
            to: "/app/marketplace",
            icon: ShoppingCartIcon,
          },
          {
            label: "Manage farm",
            desc: "Crops and tasks",
            to: "/app/farm",
            icon: GlobeAltIcon,
          },
          {
            label: "View orders",
            desc: "Track your orders",
            to: "/app/orders",
            icon: ClipboardDocumentListIcon,
          },
        ].map(({ label, desc, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="bg-white border border-[#e5e7eb] rounded-[10px]
                       p-4 hover:border-forest-200 hover:bg-forest-50
                       transition-colors group"
          >
            <div
              className="w-8 h-8 bg-forest-100 rounded-[6px]
                            flex items-center justify-center mb-3
                            group-hover:bg-forest-200 transition-colors"
            >
              <Icon className="w-4 h-4 text-forest-700" />
            </div>
            <p className="text-sm font-medium text-gray-800">{label}</p>
            <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
