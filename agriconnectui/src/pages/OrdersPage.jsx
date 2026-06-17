import { useState, useEffect } from "react";
import {
  ClipboardDocumentListIcon,
  ShoppingCartIcon,
  ArrowRightIcon,
  StarIcon,
} from "@heroicons/react/24/outline";
import { marketplaceApi } from "../api/marketplace";
import { Link } from "react-router-dom";
import clsx from "clsx";
import StarRating from "../components/ui/StarRating";

function Badge({ status }) {
  const map = {
    PENDING_PAYMENT: "bg-amber-100 text-amber-700",
    CONFIRMED: "bg-forest-100 text-forest-800",
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-blue-100 text-blue-700",
    DELIVERED: "bg-forest-100 text-forest-800",
    CANCELLED: "bg-red-100 text-red-700",
    FAILED: "bg-red-100 text-red-700",
  };
  const label = status
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={clsx(
        "inline-flex text-[11px] font-medium px-2.5 py-0.5 rounded-full",
        map[status] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {label}
    </span>
  );
}

const STATUS_STEPS = [
  "PENDING_PAYMENT",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

function OrderProgress({ status }) {
  if (status === "CANCELLED" || status === "FAILED") {
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 bg-red-200 rounded-full" />
        <p className="text-xs text-red-500 font-medium">
          {status === "CANCELLED" ? "Cancelled" : "Failed"}
        </p>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.indexOf(status);

  return (
    <div className="flex items-center gap-1">
      {STATUS_STEPS.map((step, i) => (
        <div key={step} className="flex items-center gap-1 flex-1">
          <div
            className={clsx(
              "h-1.5 flex-1 rounded-full transition-colors",
              i <= currentIndex ? "bg-forest-600" : "bg-[#e5e7eb]",
            )}
          />
        </div>
      ))}
    </div>
  );
}
function RateOrderModal({ order, onClose, onRated }) {
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {
      toast.error("Please select a star rating");
      return;
    }
    setLoading(true);
    try {
      await marketplaceApi.submitReview(order.id, rating);
      toast.success("Thank you for your review!");
      onRated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to submit review");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center
                    justify-center px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-sm p-6 flex flex-col items-center
                      gap-5 text-center"
      >
        <div
          className="w-12 h-12 bg-amber-100 rounded-full flex
                        items-center justify-center"
        >
          <StarIcon className="w-6 h-6 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 mb-1">
            Rate this order
          </p>
          <p className="text-xs text-gray-500">
            Order #{order.id.slice(0, 8).toUpperCase()} · How was your
            experience with this farmer?
          </p>
        </div>

        <StarRating value={rating} onChange={setRating} interactive size="lg" />

        <div className="flex gap-3 w-full pt-1">
          <button
            onClick={onClose}
            className="flex-1 text-sm border border-[#e5e7eb]
                             py-2.5 rounded-[8px] text-gray-500
                             hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-forest-900 text-white text-sm
                             font-medium py-2.5 rounded-[8px]
                             hover:bg-forest-800 transition-colors
                             disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit rating"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [rateOrder, setRateOrder] = useState(null);
  const [reviewedIds, setReviewedIds] = useState(new Set());

  const FILTERS = [
    { id: "ALL", label: "All orders" },
    { id: "PENDING_PAYMENT", label: "Pending" },
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "DELIVERED", label: "Delivered" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  useEffect(() => {
    async function load() {
      try {
        const res = await marketplaceApi.getMyOrders();
        setOrders(res.data.data ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  useEffect(() => {
    async function checkReviews() {
      const delivered = orders.filter((o) => o.status === "DELIVERED");
      const results = await Promise.allSettled(
        delivered.map((o) => marketplaceApi.checkReviewExists(o.id)),
      );
      const reviewed = new Set();
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.data.data) {
          reviewed.add(delivered[i].id);
        }
      });
      setReviewedIds(reviewed);
    }
    if (orders.length > 0) checkReviews();
  }, [orders]);

  const filtered =
    filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  const totalSpent = orders
    .filter((o) => o.status === "CONFIRMED" || o.status === "DELIVERED")
    .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Orders</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {orders.length} total orders
          </p>
        </div>
        <Link
          to="/app/marketplace"
          className="inline-flex items-center gap-2 bg-forest-900
                         text-white text-xs font-medium px-3 py-2
                         rounded-[8px] hover:bg-forest-800
                         transition-colors"
        >
          <ShoppingCartIcon className="w-3.5 h-3.5" />
          Browse marketplace
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-[#f8f7f4] rounded-[10px] p-4">
          <p className="text-xs text-gray-400 mb-1">Total orders</p>
          <p className="text-2xl font-semibold text-forest-900">
            {loading ? "—" : orders.length}
          </p>
        </div>
        <div className="bg-[#f8f7f4] rounded-[10px] p-4">
          <p className="text-xs text-gray-400 mb-1">Total spent</p>
          <p className="text-2xl font-semibold text-forest-900">
            {loading ? "—" : `KES ${totalSpent.toLocaleString()}`}
          </p>
        </div>
        <div className="bg-[#f8f7f4] rounded-[10px] p-4">
          <p className="text-xs text-gray-400 mb-1">Pending payment</p>
          <p className="text-2xl font-semibold text-forest-900">
            {loading
              ? "—"
              : orders.filter((o) => o.status === "PENDING_PAYMENT").length}
          </p>
        </div>
      </div>

      <div
        className="flex gap-1 bg-[#f8f7f4] rounded-[8px] p-1 w-fit
                      flex-wrap"
      >
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={clsx(
              "text-xs font-medium px-3 py-1.5 rounded-[6px]",
              "transition-colors",
              filter === f.id
                ? "bg-white text-forest-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <p className="text-sm text-gray-400">Loading orders...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center
                        h-48 gap-4 text-center"
        >
          <ClipboardDocumentListIcon className="w-10 h-10 text-gray-300" />
          <div>
            <p className="text-sm text-gray-500 mb-1">No orders yet</p>
            <p className="text-xs text-gray-400">
              Browse the marketplace to place your first order
            </p>
          </div>
          <Link
            to="/app/marketplace"
            className="inline-flex items-center gap-2 text-sm
                           text-forest-700 font-medium hover:underline"
          >
            Browse marketplace
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-[#e5e7eb]
                            rounded-[12px] p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleDateString("en-KE", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </p>
                </div>
                <Badge status={order.status} />
              </div>

              <div
                className="grid grid-cols-3 gap-3 mb-3
                              py-3 border-y border-[#f0efec]"
              >
                <div>
                  <p className="text-[11px] text-gray-400">Quantity</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    {order.quantity} units
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Amount</p>
                  <p className="text-sm font-medium text-gray-700 mt-0.5">
                    KES {order.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] text-gray-400">Phone</p>
                  <p
                    className="text-sm font-medium text-gray-700 mt-0.5
                                truncate"
                  >
                    {order.buyerPhone}
                  </p>
                </div>
              </div>

              <OrderProgress status={order.status} />
              <div className="flex justify-between mt-1.5">
                {STATUS_STEPS.map((step, i) => (
                  <p
                    key={step}
                    className={clsx(
                      "text-[10px] capitalize",
                      STATUS_STEPS.indexOf(order.status) >= i
                        ? "text-forest-600 font-medium"
                        : "text-gray-300",
                    )}
                  >
                    {step
                      .replace(/_/g, " ")
                      .toLowerCase()
                      .replace(/^\w/, (c) => c.toUpperCase())}
                  </p>
                ))}
              </div>

              {order.status === "DELIVERED" && (
                <div
                  className="flex items-center justify-between mt-3 pt-3
                                border-t border-[#f0efec]"
                >
                  {reviewedIds.has(order.id) ? (
                    <p
                      className="text-xs text-forest-600 font-medium
                                  flex items-center gap-1"
                    >
                      <StarIcon className="w-3.5 h-3.5 text-amber-400" />
                      You rated this order
                    </p>
                  ) : (
                    <button
                      onClick={() => setRateOrder(order)}
                      className="text-xs font-medium text-forest-700
                                 hover:text-forest-900 flex items-center gap-1.5
                                 transition-colors"
                    >
                      <StarIcon className="w-3.5 h-3.5" />
                      Rate this order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {rateOrder && (
        <RateOrderModal
          order={rateOrder}
          onClose={() => setRateOrder(null)}
          onRated={() => {
            setReviewedIds((prev) => new Set([...prev, rateOrder.id]));
          }}
        />
      )}
    </div>
  );
}
