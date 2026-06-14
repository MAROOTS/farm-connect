import { useState, useEffect } from "react";
import {
  UsersIcon,
  ShoppingCartIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { adminApi } from "../api/admin";
import toast from "react-hot-toast";
import clsx from "clsx";

function Spinner() {
  return (
    <div className="flex items-center justify-center h-40">
      <ArrowPathIcon className="w-6 h-6 text-gray-400 animate-spin" />
    </div>
  );
}

function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center
                    justify-center px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-5xl max-h-[88vh] overflow-hidden
                      flex flex-col"
      >
        <div
          className="flex items-center justify-between px-6 py-4
                        border-b border-[#e5e7eb] shrink-0"
        >
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-xs text-gray-500 hover:text-gray-700
                             px-3 py-1.5 border border-[#e5e7eb]
                             rounded-[6px] transition-colors"
          >
            Close
          </button>
        </div>
        <div className="overflow-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

function ManageUsersModal({ onClose }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [toggling, setToggling] = useState(null);

  useEffect(() => {
    adminApi
      .getAllUsers()
      .then((r) => setUsers(r.data.data ?? []))
      .catch(() => toast.error("Failed to load users"))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle(id, active) {
    setToggling(id);
    try {
      await adminApi.toggleActive(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, active: !u.active } : u)),
      );
      toast.success(active ? "User deactivated" : "User activated");
    } catch {
      toast.error("Failed to update user");
    } finally {
      setToggling(null);
    }
  }

  const roleColor = {
    FARMER: "bg-forest-100 text-forest-800",
    BUYER: "bg-blue-100 text-blue-700",
    SUPPLIER: "bg-amber-100 text-amber-700",
    ADMIN: "bg-red-100 text-red-700",
  };

  const filtered = users
    .filter((u) => filter === "ALL" || u.role === filter)
    .filter(
      (u) =>
        u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <ModalShell title={`All users (${users.length})`} onClose={onClose}>
      {/* Toolbar */}
      <div
        className="px-6 py-3 border-b border-[#f0efec] flex
                      items-center gap-3 flex-wrap sticky top-0
                      bg-white z-10"
      >
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2
                                          -translate-y-1/2 w-4 h-4
                                          text-gray-400"
          />
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[8px]
                            border border-[#e5e7eb] focus:outline-none
                            focus:ring-2 focus:ring-forest-200"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "FARMER", "BUYER", "SUPPLIER", "ADMIN"].map((r) => (
            <button
              key={r}
              onClick={() => setFilter(r)}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-full",
                "border transition-colors",
                filter === r
                  ? "bg-forest-900 text-white border-forest-900"
                  : "bg-white text-gray-500 border-[#e5e7eb]",
              )}
            >
              {r === "ALL"
                ? "All roles"
                : r.charAt(0) + r.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <table className="w-full">
          <thead className="bg-[#f8f7f4] sticky top-[57px]">
            <tr>
              {[
                "User",
                "Email",
                "Phone",
                "Role",
                "Verified",
                "Status",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px]
                               font-medium text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efec]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm
                               text-gray-400"
                >
                  No users found
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#fafaf9] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 bg-forest-100 rounded-full
                                    flex items-center justify-center
                                    shrink-0"
                      >
                        <p
                          className="text-xs font-semibold
                                    text-forest-800"
                        >
                          {user.fullName?.charAt(0).toUpperCase()}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-gray-800">
                        {user.fullName}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.phoneNumber}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        roleColor[user.role],
                      )}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {user.verified ? (
                      <CheckCircleIcon className="w-4 h-4 text-forest-600" />
                    ) : (
                      <XCircleIcon className="w-4 h-4 text-gray-300" />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        user.active
                          ? "bg-forest-100 text-forest-800"
                          : "bg-red-100 text-red-700",
                      )}
                    >
                      {user.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      disabled={toggling === user.id}
                      onClick={() => handleToggle(user.id, user.active)}
                      className={clsx(
                        "text-xs font-medium px-3 py-1.5 rounded-[6px]",
                        "transition-colors disabled:opacity-50",
                        user.active
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-forest-50 text-forest-700 hover:bg-forest-100",
                      )}
                    >
                      {toggling === user.id
                        ? "..."
                        : user.active
                          ? "Deactivate"
                          : "Activate"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </ModalShell>
  );
}

function ManageListingsModal({ onClose }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminApi
      .getAllListings()
      .then((r) => setListings(r.data.data ?? []))
      .catch(() => toast.error("Failed to load listings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(id, status) {
    setUpdating(id);
    try {
      if (status === "DELETED") {
        await adminApi.deleteListing(id);
        setListings((prev) => prev.filter((l) => l.id !== id));
        toast.success("Listing removed");
      } else {
        await adminApi.updateListing(id, status);
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status } : l)),
        );
        toast.success("Listing updated");
      }
    } catch {
      toast.error("Failed to update listing");
    } finally {
      setUpdating(null);
    }
  }

  const statusColor = {
    ACTIVE: "bg-forest-100 text-forest-800",
    SOLD_OUT: "bg-gray-100 text-gray-500",
    PAUSED: "bg-amber-100 text-amber-700",
    DELETED: "bg-red-100 text-red-700",
  };

  const filtered = listings
    .filter((l) => filter === "ALL" || l.status === filter)
    .filter(
      (l) =>
        l.title?.toLowerCase().includes(search.toLowerCase()) ||
        l.farmerName?.toLowerCase().includes(search.toLowerCase()),
    );

  return (
    <ModalShell title={`All listings (${listings.length})`} onClose={onClose}>
      {/* Toolbar */}
      <div
        className="px-6 py-3 border-b border-[#f0efec] flex
                      items-center gap-3 flex-wrap sticky top-0
                      bg-white z-10"
      >
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2
                                          -translate-y-1/2 w-4 h-4
                                          text-gray-400"
          />
          <input
            placeholder="Search by title or farmer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[8px]
                            border border-[#e5e7eb] focus:outline-none
                            focus:ring-2 focus:ring-forest-200"
          />
        </div>
        <div className="flex gap-1.5">
          {["ALL", "ACTIVE", "PAUSED", "SOLD_OUT"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-full",
                "border transition-colors",
                filter === s
                  ? "bg-forest-900 text-white border-forest-900"
                  : "bg-white text-gray-500 border-[#e5e7eb]",
              )}
            >
              {s === "ALL"
                ? "All"
                : s
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <table className="w-full">
          <thead className="bg-[#f8f7f4] sticky top-[57px]">
            <tr>
              {[
                "Listing",
                "Farmer",
                "Category",
                "Price",
                "Qty",
                "Status",
                "Actions",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px]
                               font-medium text-gray-400"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efec]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-sm
                               text-gray-400"
                >
                  No listings found
                </td>
              </tr>
            ) : (
              filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[#fafaf9] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {l.imageUrls?.[0] || l.imageUrl ? (
                        <img
                          src={l.imageUrls?.[0] || l.imageUrl}
                          alt={l.title}
                          className="w-9 h-9 rounded-[6px] object-cover
                                   shrink-0 border border-[#e5e7eb]"
                        />
                      ) : (
                        <div
                          className="w-9 h-9 rounded-[6px] bg-[#f0efec]
                                      shrink-0 flex items-center
                                      justify-center"
                        >
                          <ShoppingCartIcon className="w-4 h-4 text-gray-300" />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {l.title}
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {l.category}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {l.farmerName}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {l.category}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-medium
                               text-gray-800"
                  >
                    KES {l.pricePerUnit}/{l.unit}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {l.quantityAvailable} {l.unit}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        statusColor[l.status],
                      )}
                    >
                      {l.status
                        ?.replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      {l.status === "ACTIVE" ? (
                        <button
                          disabled={updating === l.id}
                          onClick={() => handleStatus(l.id, "PAUSED")}
                          className="text-xs font-medium px-2.5 py-1
                                   rounded-[5px] bg-amber-50
                                   text-amber-700 hover:bg-amber-100
                                   transition-colors disabled:opacity-50"
                        >
                          Pause
                        </button>
                      ) : l.status === "PAUSED" ? (
                        <button
                          disabled={updating === l.id}
                          onClick={() => handleStatus(l.id, "ACTIVE")}
                          className="text-xs font-medium px-2.5 py-1
                                   rounded-[5px] bg-forest-50
                                   text-forest-700 hover:bg-forest-100
                                   transition-colors disabled:opacity-50"
                        >
                          Activate
                        </button>
                      ) : null}
                      <button
                        disabled={updating === l.id}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove "${l.title}"? This cannot be undone.`,
                            )
                          )
                            handleStatus(l.id, "DELETED");
                        }}
                        className="p-1.5 rounded-[5px] bg-red-50
                                 text-red-500 hover:bg-red-100
                                 transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </ModalShell>
  );
}

function ManageOrdersModal({ onClose }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    adminApi
      .getAllOrders()
      .then((r) => setOrders(r.data.data ?? []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatusUpdate(id, status) {
    setUpdating(id);
    try {
      await adminApi.updateOrder(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o)),
      );
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order");
    } finally {
      setUpdating(null);
    }
  }

  const statusColor = {
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-forest-100 text-forest-800",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-forest-100 text-forest-800",
    CANCELLED: "bg-red-100 text-red-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const nextStatuses = {
    PENDING_PAYMENT: ["CONFIRMED", "CANCELLED"],
    CONFIRMED: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [],
    CANCELLED: [],
    FAILED: [],
  };

  const filtered = orders
    .filter((o) => filter === "ALL" || o.status === filter)
    .filter(
      (o) =>
        o.id?.toLowerCase().includes(search.toLowerCase()) ||
        o.buyerId?.toLowerCase().includes(search.toLowerCase()) ||
        o.buyerPhone?.includes(search),
    );

  const totalRevenue = orders
    .filter((o) => o.status === "CONFIRMED" || o.status === "DELIVERED")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <ModalShell title={`All orders (${orders.length})`} onClose={onClose}>
      {/* Summary row */}
      <div
        className="px-6 py-3 border-b border-[#f0efec] grid
                      grid-cols-4 gap-3 bg-[#f8f7f4]"
      >
        {[
          { label: "Total orders", value: orders.length },
          {
            label: "Confirmed",
            value: orders.filter((o) => o.status === "CONFIRMED").length,
          },
          {
            label: "Pending payment",
            value: orders.filter((o) => o.status === "PENDING_PAYMENT").length,
          },
          { label: "Revenue", value: `KES ${totalRevenue.toLocaleString()}` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="bg-white rounded-[8px] p-3
                                      border border-[#e5e7eb]"
          >
            <p className="text-[11px] text-gray-400">{label}</p>
            <p className="text-base font-semibold text-forest-900 mt-0.5">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div
        className="px-6 py-3 border-b border-[#f0efec] flex
                      items-center gap-3 flex-wrap bg-white"
      >
        <div className="relative flex-1 min-w-48">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2
                                          -translate-y-1/2 w-4 h-4
                                          text-gray-400"
          />
          <input
            placeholder="Search by order ID or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[8px]
                            border border-[#e5e7eb] focus:outline-none
                            focus:ring-2 focus:ring-forest-200"
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            "ALL",
            "PENDING_PAYMENT",
            "CONFIRMED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
          ].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-full",
                "border transition-colors whitespace-nowrap",
                filter === s
                  ? "bg-forest-900 text-white border-forest-900"
                  : "bg-white text-gray-500 border-[#e5e7eb]",
              )}
            >
              {s === "ALL"
                ? "All"
                : s
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Spinner />
      ) : (
        <table className="w-full">
          <thead className="bg-[#f8f7f4]">
            <tr>
              {[
                "Order ID",
                "Buyer",
                "Phone",
                "Qty",
                "Amount",
                "Status",
                "Date",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left text-[11px]
                               font-medium text-gray-400 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f0efec]">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-sm
                               text-gray-400"
                >
                  No orders found
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="hover:bg-[#fafaf9] transition-colors">
                  <td className="px-4 py-3">
                    <p
                      className="text-xs font-mono font-semibold
                                text-gray-700"
                    >
                      #{o.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {o.buyerId?.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {o.buyerPhone}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {o.quantity}
                  </td>
                  <td
                    className="px-4 py-3 text-sm font-medium
                               text-gray-800"
                  >
                    KES {o.totalAmount?.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "text-[11px] font-medium px-2 py-0.5 rounded-full",
                        "whitespace-nowrap",
                        statusColor[o.status],
                      )}
                    >
                      {o.status
                        ?.replace(/_/g, " ")
                        .toLowerCase()
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </span>
                  </td>
                  <td
                    className="px-4 py-3 text-xs text-gray-400
                               whitespace-nowrap"
                  >
                    {o.createdAt
                      ? new Date(o.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                        })
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {nextStatuses[o.status]?.length > 0 ? (
                      <select
                        disabled={updating === o.id}
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value)
                            handleStatusUpdate(o.id, e.target.value);
                        }}
                        className="text-xs border border-[#e5e7eb]
                                 rounded-[6px] px-2 py-1 bg-white
                                 text-gray-600 focus:outline-none
                                 focus:ring-1 focus:ring-forest-200
                                 disabled:opacity-50"
                      >
                        <option value="" disabled>
                          Update...
                        </option>
                        {nextStatuses[o.status].map((s) => (
                          <option key={s} value={s}>
                            {s
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/^\w/, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-gray-300">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </ModalShell>
  );
}

function ManageCard({
  icon: Icon,
  title,
  desc,
  btnLabel,
  btnColor,
  iconBg,
  iconColor,
  onClick,
}) {
  const btnColors = {
    green: "bg-forest-900 hover:bg-forest-800 text-white",
    blue: "bg-blue-700 hover:bg-blue-800 text-white",
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
    purple: "bg-purple-600 hover:bg-purple-700 text-white",
    red: "bg-red-600 hover:bg-red-700 text-white",
    gray: "bg-gray-700 hover:bg-gray-800 text-white",
  };
  return (
    <div
      className="bg-white border border-[#e5e7eb] rounded-[12px]
                    overflow-hidden flex flex-col"
      style={{ borderTop: "3px solid #f59e0b" }}
    >
      <div
        className="p-6 flex flex-col items-center text-center
                      gap-3 flex-1"
      >
        <div
          className={clsx(
            "w-16 h-16 rounded-full flex items-center justify-center",
            iconBg,
          )}
        >
          <Icon className={clsx("w-7 h-7", iconColor)} />
        </div>
        <p className="text-sm font-bold text-forest-900">{title}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
      </div>
      <div className="px-6 pb-6">
        <button
          onClick={onClick}
          className={clsx(
            "w-full flex items-center justify-center gap-2",
            "text-sm font-medium py-2.5 rounded-[8px]",
            "transition-colors",
            btnColors[btnColor],
          )}
        >
          <Icon className="w-4 h-4" />
          {btnLabel}
        </button>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  // modal: null | "users" | "listings" | "orders"

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, listingsRes] = await Promise.allSettled([
          adminApi.getStats(),
          adminApi.getAllListings(),
        ]);
        if (statsRes.status === "fulfilled") setStats(statsRes.value.data.data);
        if (listingsRes.status === "fulfilled")
          setListings(listingsRes.value.data.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeListings = listings.filter((l) => l.status === "ACTIVE").length;

  const cards = [
    {
      icon: UsersIcon,
      title: "Manage Users",
      desc: "View and manage all registered users. Activate or deactivate accounts instantly.",
      btnLabel: "Manage",
      btnColor: "green",
      iconBg: "bg-forest-100",
      iconColor: "text-forest-700",
      onClick: () => setModal("users"),
    },
    {
      icon: GlobeAltIcon,
      title: "Manage Farmers",
      desc: "View all registered farmers, their farms, crops and production activity.",
      btnLabel: "View",
      btnColor: "blue",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
      onClick: () => setModal("users"),
    },
    {
      icon: ShoppingCartIcon,
      title: "Manage Listings",
      desc: "View, moderate and manage all marketplace produce listings. Pause or remove listings.",
      btnLabel: "Manage",
      btnColor: "green",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      onClick: () => setModal("listings"),
    },
    {
      icon: ClipboardDocumentListIcon,
      title: "Manage Orders",
      desc: "View all orders placed on the platform. Update order status through the fulfilment pipeline.",
      btnLabel: "Manage",
      btnColor: "purple",
      iconBg: "bg-purple-100",
      iconColor: "text-purple-700",
      onClick: () => setModal("orders"),
    },
    {
      icon: ChartBarIcon,
      title: "Platform Analytics",
      desc: "View platform-wide analytics, revenue trends and user growth metrics.",
      btnLabel: "View",
      btnColor: "amber",
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
      onClick: () => toast("Analytics coming soon"),
    },
    {
      icon: Cog6ToothIcon,
      title: "Platform Settings",
      desc: "Configure platform-wide settings, notification templates and system parameters.",
      btnLabel: "Configure",
      btnColor: "gray",
      iconBg: "bg-gray-100",
      iconColor: "text-gray-600",
      onClick: () => toast("Settings coming soon"),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-forest-900 mb-1">
          Admin Control Center
        </h1>
        <p className="text-sm text-gray-500">
          Monitor and manage the AgriConnect platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-forest-900 rounded-[12px] p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <UsersIcon className="w-4 h-4 text-forest-300" />
            <p
              className="text-[11px] font-medium text-forest-300
                          uppercase tracking-wider"
            >
              Platform Users
            </p>
          </div>
          <div className="flex items-end gap-5">
            <div>
              <p className="text-4xl font-bold">
                {loading ? "—" : (stats?.totalUsers ?? 0)}
              </p>
              <p className="text-xs text-forest-300 mt-1">Total registered</p>
            </div>
            <div className="flex gap-3 mb-1">
              <div>
                <p className="text-lg font-semibold text-amber-400">
                  {loading ? "—" : (stats?.farmers ?? 0)}
                </p>
                <p className="text-[11px] text-forest-300">Farmers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-blue-300">
                  {loading ? "—" : (stats?.buyers ?? 0)}
                </p>
                <p className="text-[11px] text-forest-300">Buyers</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-purple-300">
                  {loading ? "—" : (stats?.suppliers ?? 0)}
                </p>
                <p className="text-[11px] text-forest-300">Suppliers</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-forest-900 rounded-[12px] p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <ShoppingCartIcon className="w-4 h-4 text-forest-300" />
            <p
              className="text-[11px] font-medium text-forest-300
                          uppercase tracking-wider"
            >
              Marketplace
            </p>
          </div>
          <div className="flex items-end gap-5">
            <div>
              <p className="text-4xl font-bold">
                {loading ? "—" : listings.length}
              </p>
              <p className="text-xs text-forest-300 mt-1">Total listings</p>
            </div>
            <div className="flex gap-3 mb-1">
              <div>
                <p className="text-lg font-semibold text-green-300">
                  {loading ? "—" : activeListings}
                </p>
                <p className="text-[11px] text-forest-300">Active</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-gray-400">
                  {loading ? "—" : listings.length - activeListings}
                </p>
                <p className="text-[11px] text-forest-300">Inactive</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-forest-900 rounded-[12px] p-5 text-white">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircleIcon className="w-4 h-4 text-forest-300" />
            <p
              className="text-[11px] font-medium text-forest-300
                          uppercase tracking-wider"
            >
              Account Health
            </p>
          </div>
          <div className="flex items-end gap-5">
            <div>
              <p className="text-4xl font-bold">
                {loading ? "—" : (stats?.verified ?? 0)}
              </p>
              <p className="text-xs text-forest-300 mt-1">Verified accounts</p>
            </div>
            <div className="flex gap-3 mb-1">
              <div>
                <p className="text-lg font-semibold text-green-300">
                  {loading ? "—" : (stats?.active ?? 0)}
                </p>
                <p className="text-[11px] text-forest-300">Active</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-red-300">
                  {loading
                    ? "—"
                    : (stats?.totalUsers ?? 0) - (stats?.active ?? 0)}
                </p>
                <p className="text-[11px] text-forest-300">Inactive</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <ManageCard key={card.title} {...card} />
        ))}
      </div>

      {modal === "users" && <ManageUsersModal onClose={() => setModal(null)} />}
      {modal === "listings" && (
        <ManageListingsModal onClose={() => setModal(null)} />
      )}
      {modal === "orders" && (
        <ManageOrdersModal onClose={() => setModal(null)} />
      )}
    </div>
  );
}
