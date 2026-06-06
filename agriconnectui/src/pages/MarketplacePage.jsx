// agriconnectui/src/pages/MarketplacePage.jsx

import { useState, useEffect } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  FunnelIcon,
  MapPinIcon,
  XMarkIcon,
  ShoppingCartIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { marketplaceApi } from "../api/marketplace";
import { mediaApi } from "../api/media";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";

const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Grains",
  "Legumes",
  "Dairy",
  "Poultry",
  "Other",
];

function Badge({ status }) {
  const map = {
    ACTIVE: "bg-forest-100 text-forest-800",
    SOLD_OUT: "bg-gray-100 text-gray-500",
    PAUSED: "bg-amber-100 text-amber-700",
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

// ── Create listing modal ──────────────────────────────────────
function CreateListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerUnit: "",
    unit: "kg",
    quantityAvailable: "",
    category: "Vegetables",
    imageUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.pricePerUnit || !form.quantityAvailable) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = form.imageUrl;

      // Upload image first if selected
      if (imageFile) {
        setUploading(true);
        const res = await mediaApi.uploadListingImage(imageFile);
        imageUrl = res.data.data.imageUrl;
        setUploading(false);
      }

      await marketplaceApi.createListing({
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
        quantityAvailable: parseFloat(form.quantityAvailable),
        imageUrl,
      });

      toast.success("Listing created successfully!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create listing");
    } finally {
      setLoading(false);
      setUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-lg max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4
                        border-b border-[#e5e7eb] sticky top-0 bg-white"
        >
          <h2 className="text-base font-semibold text-gray-900">New listing</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-gray-100
                             text-gray-400 hover:text-gray-600
                             transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Image upload */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Product image
            </label>
            <label
              className={clsx(
                "w-full h-32 border-2 border-dashed rounded-[10px]",
                "flex flex-col items-center justify-center cursor-pointer",
                "transition-colors",
                imagePreview
                  ? "border-forest-300 bg-forest-50"
                  : "border-[#e5e7eb] hover:border-forest-300 hover:bg-forest-50",
              )}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="preview"
                  className="h-full w-full object-cover rounded-[10px]"
                />
              ) : (
                <>
                  <PhotoIcon className="w-8 h-8 text-gray-300 mb-2" />
                  <p className="text-xs text-gray-400">Click to upload image</p>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    JPEG, PNG, WebP · max 10MB
                  </p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageSelect}
              />
            </label>
          </div>

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              placeholder="e.g. Fresh Tomatoes"
              className="w-full px-3 py-2 text-sm rounded-[8px]
                              border border-[#e5e7eb] focus:outline-none
                              focus:ring-2 focus:ring-forest-200
                              focus:border-forest-400"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={2}
              placeholder="Describe your produce..."
              className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] focus:outline-none
                                 focus:ring-2 focus:ring-forest-200
                                 focus:border-forest-400 resize-none"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-[8px]
                               border border-[#e5e7eb] bg-white
                               focus:outline-none focus:ring-2
                               focus:ring-forest-200
                               focus:border-forest-400"
            >
              {CATEGORIES.filter((c) => c !== "All").map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Price + unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Price (KES) <span className="text-red-400">*</span>
              </label>
              <input
                name="pricePerUnit"
                value={form.pricePerUnit}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.01"
                required
                placeholder="120"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">Unit</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] bg-white
                                 focus:outline-none focus:ring-2
                                 focus:ring-forest-200
                                 focus:border-forest-400"
              >
                {["kg", "g", "bag", "crate", "bunch", "piece", "litre"].map(
                  (u) => (
                    <option key={u}>{u}</option>
                  ),
                )}
              </select>
            </div>
          </div>

          {/* Quantity */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Available quantity <span className="text-red-400">*</span>
            </label>
            <input
              name="quantityAvailable"
              value={form.quantityAvailable}
              onChange={handleChange}
              type="number"
              min="1"
              required
              placeholder="200"
              className="w-full px-3 py-2 text-sm rounded-[8px]
                              border border-[#e5e7eb] focus:outline-none
                              focus:ring-2 focus:ring-forest-200
                              focus:border-forest-400"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 text-sm border border-[#e5e7eb]
                               py-2.5 rounded-[8px] text-gray-500
                               hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center
                               justify-center gap-2 bg-forest-900
                               text-white text-sm font-medium py-2.5
                               rounded-[8px] hover:bg-forest-800
                               transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  {uploading ? "Uploading..." : "Creating..."}
                </>
              ) : (
                "Create listing"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Order modal ───────────────────────────────────────────────
function OrderModal({ listing, onClose, onOrdered }) {
  const [step, setStep] = useState("details"); // details | waiting | otp
  const [form, setForm] = useState({
    quantity: 1,
    buyerPhone: "",
  });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  const total = (listing.pricePerUnit * form.quantity).toLocaleString();

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!form.buyerPhone) {
      toast.error("Phone number is required for payment verification");
      return;
    }
    setLoading(true);
    try {
      const res = await marketplaceApi.placeOrder({
        listingId: listing.id,
        quantity: parseFloat(form.quantity),
        buyerPhone: form.buyerPhone,
      });
      setOrderId(res.data.data.id);
      toast.success("Order placed! Check your phone for the payment code.");
      setStep("waiting");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to place order");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyPayment(e) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length < 6) return;
    setLoading(true);
    try {
      await marketplaceApi.verifyPayment({ orderId, otp: code });
      toast.success("Payment verified! Order confirmed.");
      onOrdered();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Invalid payment code");
      setOtp(["", "", "", "", "", ""]);
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(index, value) {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];
    updated[index] = value.slice(-1);
    setOtp(updated);
    if (value && index < 5) {
      document.getElementById(`ootp-${index + 1}`)?.focus();
    }
  }

  function handleOtpKeyDown(index, e) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`ootp-${index - 1}`)?.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-sm"
      >
        <div
          className="flex items-center justify-between px-5 py-4
                        border-b border-[#e5e7eb]"
        >
          <h2 className="text-base font-semibold text-gray-900">
            {step === "details"
              ? "Place order"
              : step === "waiting"
                ? "Payment pending"
                : "Verify payment"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-gray-100
                             text-gray-400"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {step === "details" && (
          <form onSubmit={handlePlaceOrder} className="p-5 flex flex-col gap-4">
            {/* Listing summary */}
            <div className="bg-[#f8f7f4] rounded-[10px] p-3">
              <p className="text-sm font-semibold text-gray-800">
                {listing.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                KES {listing.pricePerUnit} per {listing.unit} ·{" "}
                {listing.quantityAvailable} {listing.unit} available
              </p>
            </div>

            {/* Quantity */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Quantity ({listing.unit})
              </label>
              <input
                type="number"
                min="1"
                max={listing.quantityAvailable}
                value={form.quantity}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    quantity: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Phone number for payment code
              </label>
              <input
                type="tel"
                placeholder="+254 700 000 000"
                value={form.buyerPhone}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    buyerPhone: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
              <p className="text-[11px] text-gray-400">
                You'll receive an SMS code to confirm this payment.
              </p>
            </div>

            {/* Total */}
            <div
              className="flex items-center justify-between py-2
                            border-t border-[#f0efec]"
            >
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-base font-semibold text-forest-900">
                KES {total}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center
                               justify-center gap-2 bg-forest-900
                               text-white text-sm font-medium py-2.5
                               rounded-[8px] hover:bg-forest-800
                               transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Placing order...
                </>
              ) : (
                "Place order"
              )}
            </button>
          </form>
        )}

        {step === "waiting" && (
          <div className="p-5 flex flex-col items-center gap-4 text-center">
            <div
              className="w-14 h-14 bg-forest-100 rounded-full flex items-center
                            justify-center"
            >
              <svg
                className="animate-spin w-7 h-7 text-forest-700"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                M-Pesa prompt sent
              </p>
              <p className="text-sm text-gray-500">
                Check your phone{" "}
                <span className="font-medium text-gray-700">
                  {form.buyerPhone}
                </span>{" "}
                and enter your M-Pesa PIN to complete payment.
              </p>
            </div>
            <div className="w-full bg-[#f8f7f4] rounded-[10px] p-3 text-left">
              <p className="text-xs text-gray-500">Amount to pay</p>
              <p className="text-lg font-semibold text-forest-900 mt-0.5">
                KES {total}
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Your order will be confirmed automatically once payment is
              received.
            </p>
            <button
              onClick={onClose}
              className="text-sm text-gray-400 hover:text-gray-600
                               transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {step === "otp" && (
          <form
            onSubmit={handleVerifyPayment}
            className="p-5 flex flex-col gap-5"
          >
            <p className="text-sm text-gray-500">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-gray-700">
                {form.buyerPhone}
              </span>
            </p>
            <div className="flex gap-2 justify-between">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`ootp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  autoFocus={index === 0}
                  className="w-11 h-13 text-center text-xl
                                  font-semibold text-forest-900
                                  border border-[#e5e7eb] rounded-[10px]
                                  bg-[#f8f7f4] focus:outline-none
                                  focus:ring-2 focus:ring-forest-200
                                  focus:border-forest-400
                                  focus:bg-white transition-all"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full inline-flex items-center
                               justify-center gap-2 bg-forest-900
                               text-white text-sm font-medium py-2.5
                               rounded-[8px] hover:bg-forest-800
                               transition-colors disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────
export default function MarketplacePage() {
  const user = useAuthStore((s) => s.user);
  const [listings, setListings] = useState([]);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState("browse");
  const [showCreate, setShowCreate] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);

  async function loadListings() {
    try {
      const [allRes, myRes] = await Promise.allSettled([
        marketplaceApi.getListings(category !== "All" ? category : undefined),
        marketplaceApi.getMyListings(),
      ]);
      if (allRes.status === "fulfilled")
        setListings(allRes.value.data.data ?? []);
      if (myRes.status === "fulfilled")
        setMyListings(myRes.value.data.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadListings();
  }, [category]);

  const filtered = listings.filter(
    (l) =>
      l.title.toLowerCase().includes(search.toLowerCase()) ||
      l.category?.toLowerCase().includes(search.toLowerCase()),
  );

  const displayListings = tab === "browse" ? filtered : myListings;

  return (
    <div className="flex flex-col gap-5">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Marketplace</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {listings.length} active listings
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center gap-2 bg-forest-900
                           text-white text-xs font-medium px-3 py-2
                           rounded-[8px] hover:bg-forest-800
                           transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          New listing
        </button>
      </div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div
        className="flex items-center gap-1 bg-[#f8f7f4]
                      rounded-[8px] p-1 w-fit"
      >
        {[
          { id: "browse", label: "Browse all" },
          { id: "mine", label: "My listings" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "text-xs font-medium px-3 py-1.5 rounded-[6px]",
              "transition-colors",
              tab === t.id
                ? "bg-white text-forest-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Search + filter ─────────────────────────────────── */}
      {tab === "browse" && (
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlassIcon
              className="absolute left-3 top-1/2
                                            -translate-y-1/2 w-4 h-4
                                            text-gray-400"
            />
            <input
              placeholder="Search listings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-[8px]
                              border border-[#e5e7eb] bg-white
                              focus:outline-none focus:ring-2
                              focus:ring-forest-200
                              focus:border-forest-400"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  "text-xs font-medium px-3 py-1.5 rounded-full",
                  "border transition-colors",
                  category === c
                    ? "bg-forest-900 text-white border-forest-900"
                    : "bg-white text-gray-500 border-[#e5e7eb] hover:border-forest-300",
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Listings grid ───────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5e7eb]
                                    rounded-[12px] overflow-hidden
                                    animate-pulse"
            >
              <div className="h-40 bg-gray-100" />
              <div className="p-4 flex flex-col gap-2">
                <div className="h-4 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : displayListings.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingCartIcon
            className="w-10 h-10 text-gray-300
                                        mx-auto mb-3"
          />
          <p className="text-sm text-gray-500 mb-4">
            {tab === "mine"
              ? "You haven't created any listings yet"
              : "No listings found"}
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-2 bg-forest-900
                             text-white text-sm font-medium px-4 py-2
                             rounded-[8px] hover:bg-forest-800
                             transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Create listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-[#e5e7eb]
                            rounded-[12px] overflow-hidden
                            hover:border-forest-200 transition-colors
                            flex flex-col"
            >
              {/* Image */}
              <div
                className="h-40 bg-[#f8f7f4] flex items-center
                              justify-center overflow-hidden"
              >
                {listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <PhotoIcon className="w-10 h-10 text-gray-300" />
                )}
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className="text-sm font-semibold text-gray-900
                                leading-tight"
                  >
                    {listing.title}
                  </p>
                  <Badge status={listing.status} />
                </div>

                {listing.description && (
                  <p
                    className="text-xs text-gray-500 leading-relaxed
                                line-clamp-2"
                  >
                    {listing.description}
                  </p>
                )}

                <div
                  className="flex items-center justify-between
                                mt-auto pt-2"
                >
                  <div>
                    <p className="text-sm font-semibold text-forest-900">
                      KES {listing.pricePerUnit}
                      <span
                        className="text-xs text-gray-400
                                       font-normal"
                      >
                        /{listing.unit}
                      </span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {listing.quantityAvailable} {listing.unit} available
                    </p>
                  </div>

                  {listing.status === "ACTIVE" &&
                    listing.farmerId !== user?.id && (
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="inline-flex items-center gap-1.5
                                 bg-forest-900 text-white text-xs
                                 font-medium px-3 py-1.5 rounded-[6px]
                                 hover:bg-forest-800 transition-colors"
                      >
                        <ShoppingCartIcon className="w-3.5 h-3.5" />
                        Order
                      </button>
                    )}
                </div>

                <div className="flex items-center gap-1 mt-1">
                  <MapPinIcon className="w-3 h-3 text-gray-300" />
                  <p className="text-[11px] text-gray-400">
                    {listing.farmerName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      {showCreate && (
        <CreateListingModal
          onClose={() => setShowCreate(false)}
          onCreated={loadListings}
        />
      )}
      {selectedListing && (
        <OrderModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onOrdered={loadListings}
        />
      )}
    </div>
  );
}
