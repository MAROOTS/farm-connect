import { useState, useEffect, useRef } from "react";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  MapPinIcon,
  XMarkIcon,
  ShoppingCartIcon,
  PhotoIcon,
  CheckCircleIcon,
  StarIcon,
  MapPinIcon,
} from "@heroicons/react/24/outline";
import { marketplaceApi } from "../api/marketplace";
import { mediaApi } from "../api/media";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";
import { farmApi } from "../api/farm";

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

function CreateListingModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    pricePerUnit: "",
    unit: "kg",
    quantityAvailable: "",
    category: "Vegetables",
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [farmLocation, setFarmLocation] = useState(null);
  const [loadingFarm, setLoadingFarm]   = useState(true);

  useEffect(()=>{
    farmApi.getMyFarm()
        .then((res) => setFarmLocation(res.data.data?.location ?? null))
        .catch(() => setFarmLocation(null))
        .finally(() => setLoadingFarm(false));
  },[]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  function handleImageSelect(e) {
    const newFiles = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...newFiles].slice(0, 3));
    setImagePreviews((prev) =>
      [...prev, ...newFiles.map((f) => URL.createObjectURL(f))].slice(0, 3),
    );
  }

  function removeImage(index) {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.pricePerUnit || !form.quantityAvailable) {
      toast.error("Please fill in all required fields");
      return;
    }
    setLoading(true);
    try {
      const imageUrls = [];
      for (const file of imageFiles) {
        setUploading(true);
        const res = await mediaApi.uploadListingImage(file);
        imageUrls.push(res.data.data.imageUrl);
      }
      setUploading(false);

      await marketplaceApi.createListing({
        ...form,
        pricePerUnit: parseFloat(form.pricePerUnit),
        quantityAvailable: parseFloat(form.quantityAvailable),
        imageUrls,
        farmerLocation: farmLocation,
      });

      toast.success("Listing created!");
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Product images
              <span className="text-gray-400 font-normal"> (up to 3)</span>
            </label>

            {/* Previews */}
            {imagePreviews.length > 0 && (
              <div className="flex gap-2 mb-1">
                {imagePreviews.map((preview, i) => (
                  <div
                    key={i}
                    className="relative w-24 h-24 rounded-[8px]
                                  overflow-hidden border border-[#e5e7eb]"
                  >
                    <img
                      src={preview}
                      alt={`preview ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-5 h-5
                                 bg-red-500 text-white rounded-full
                                 flex items-center justify-center
                                 text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload area — only shown if less than 3 images */}
            {imagePreviews.length < 3 && (
              <label
                className={clsx(
                  "w-full h-24 border-2 border-dashed rounded-[10px]",
                  "flex flex-col items-center justify-center cursor-pointer",
                  "border-[#e5e7eb] hover:border-forest-300",
                  "hover:bg-forest-50 transition-colors",
                )}
              >
                <PhotoIcon className="w-6 h-6 text-gray-300 mb-1" />
                <p className="text-xs text-gray-400">
                  Click to add {imagePreviews.length === 0 ? "images" : "more"}
                </p>
                <p className="text-[11px] text-gray-300 mt-0.5">
                  {3 - imagePreviews.length} remaining · JPEG, PNG, WebP
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                />
              </label>
            )}
          </div>

        <div className="flex items-center gap-2 px-3 py-2 bg-[#f8f7f4]
                        rounded-[8px]">
          <MapPinIcon className="w-4 h-4 text-forest-600 shrink-0" />
          {loadingFarm ? (
            <p className="text-xs text-gray-400">Loading your farm location...</p>
          ) : farmLocation ? (
            <p className="text-xs text-gray-600">
              Listing location: <span className="font-medium text-gray-800">
                {farmLocation}
              </span>
            </p>
          ) : (
            <p className="text-xs text-amber-600">
              No farm location set. Add your farm location in{" "}
              <span className="font-medium">My Farm</span> first.
            </p>
          )}
        </div>
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

function OrderModal({ listing, onClose, onOrdered }) {
  const [step, setStep] = useState("details");
  const [form, setForm] = useState({ quantity: 1, buyerPhone: "" });
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [orderId, setOrderId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const pollRef = useRef(null);

  const total = (listing.pricePerUnit * form.quantity).toLocaleString();

  // Poll every 5 seconds to check if M-Pesa payment was confirmed
  useEffect(() => {
    if (step === "waiting" && orderId && !orderConfirmed) {
      pollRef.current = setInterval(async () => {
        try {
          const res = await marketplaceApi.getMyOrders();
          const orders = res.data.data ?? [];
          const thisOrder = orders.find((o) => o.id === orderId);
          if (thisOrder?.status === "CONFIRMED") {
            setOrderConfirmed(true);
            clearInterval(pollRef.current);
            toast.success("Payment confirmed! Order placed.");
          }
        } catch {
          // silent — keep polling
        }
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [step, orderId, orderConfirmed]);

  async function handlePlaceOrder(e) {
    e.preventDefault();
    if (!form.buyerPhone) {
      toast.error("Phone number is required");
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
      toast.success("Order placed! Check your phone for the M-Pesa prompt.");
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
            <div className="bg-[#f8f7f4] rounded-[10px] p-3">
              <p className="text-sm font-semibold text-gray-800">
                {listing.title}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                KES {listing.pricePerUnit} per {listing.unit} ·{" "}
                {listing.quantityAvailable} {listing.unit} available
              </p>
              {listing.farmerLocation && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <MapPinIcon className="w-3 h-3 text-gray-400" />
                  {listing.farmerLocation}
                </p>
            )}
            </div>

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

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                M-Pesa phone number
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
                You'll receive an M-Pesa STK push to this number.
              </p>
            </div>

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
            {orderConfirmed ? (
              <>
                <div
                  className="w-14 h-14 bg-forest-100 rounded-full
                                flex items-center justify-center"
                >
                  <CheckCircleIcon className="w-8 h-8 text-forest-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-1">
                    Payment confirmed!
                  </p>
                  <p className="text-sm text-gray-500">
                    Your order has been placed successfully.
                  </p>
                </div>
                <button
                  onClick={() => {
                    onOrdered();
                    onClose();
                  }}
                  className="w-full bg-forest-900 text-white text-sm
                             font-medium py-2.5 rounded-[8px]
                             hover:bg-forest-800 transition-colors"
                >
                  View my orders
                </button>
              </>
            ) : (
              <>
                <div
                  className="w-14 h-14 bg-forest-100 rounded-full
                                flex items-center justify-center"
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
                    Check{" "}
                    <span className="font-medium text-gray-700">
                      {form.buyerPhone}
                    </span>{" "}
                    and enter your M-Pesa PIN.
                  </p>
                </div>
                <div
                  className="w-full bg-[#f8f7f4] rounded-[10px]
                                p-3 text-left"
                >
                  <p className="text-xs text-gray-500">Amount</p>
                  <p className="text-lg font-semibold text-forest-900 mt-0.5">
                    KES {total}
                  </p>
                </div>
                <p className="text-xs text-gray-400">
                  Checking payment status automatically every 5 seconds...
                </p>
                <button
                  onClick={onClose}
                  className="text-sm text-gray-400
                                   hover:text-gray-600 transition-colors"
                >
                  Close and check orders later
                </button>
              </>
            )}
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
                  className="w-11 h-12 text-center text-xl
                                  font-semibold text-forest-900
                                  border border-[#e5e7eb] rounded-[10px]
                                  bg-[#f8f7f4] focus:outline-none
                                  focus:ring-2 focus:ring-forest-200
                                  focus:border-forest-400 focus:bg-white
                                  transition-all"
                />
              ))}
            </div>
            <button
              type="submit"
              disabled={loading || otp.join("").length < 6}
              className="w-full bg-forest-900 text-white text-sm
                               font-medium py-2.5 rounded-[8px]
                               hover:bg-forest-800 transition-colors
                               disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Confirm payment"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

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
  const [activeImage, setActiveImage] = useState({});
  const [farmerRatings, setFarmerRatings] = useState({});

  useEffect(() => {
    async function loadRatings() {
      const uniqueFarmerIds = [
        ...new Set(listings.map((l) => l.farmerId).filter(Boolean)),
      ];
      const results = await Promise.allSettled(
        uniqueFarmerIds.map((id) => marketplaceApi.getFarmerRating(id)),
      );
      const ratings = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled") {
          ratings[uniqueFarmerIds[i]] = r.value.data.data;
        }
      });
      setFarmerRatings(ratings);
    }
    if (listings.length > 0) loadRatings();
  }, [listings]);

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
              className="w-full pl-9 pr-3 py-2 text-sm
                              rounded-[8px] border border-[#e5e7eb]
                              bg-white focus:outline-none
                              focus:ring-2 focus:ring-forest-200
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

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-[#e5e7eb]
                                    rounded-[12px] overflow-hidden
                                    animate-pulse"
            >
              <div className="h-44 bg-gray-100" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayListings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white border border-[#e5e7eb]
                            rounded-[14px] overflow-hidden
                            hover:shadow-sm hover:border-forest-200
                            transition-all flex flex-col group"
            >
              <div className="relative aspect-[4/3] bg-[#f0efec] overflow-hidden">
                {/* Image */}
                {listing.imageUrls?.length > 0 ? (
                  <img
                    src={listing.imageUrls[activeImage?.[listing.id] ?? 0]}
                    alt={listing.title}
                    className="w-full h-full object-cover
                               group-hover:scale-[1.02] transition-transform
                               duration-300"
                  />
                ) : listing.imageUrl ? (
                  <img
                    src={listing.imageUrl}
                    alt={listing.title}
                    className="w-full h-full object-cover
                               group-hover:scale-[1.02] transition-transform
                               duration-300"
                  />
                ) : (
                  <div
                    className="w-full h-full flex flex-col items-center
                                  justify-center gap-2"
                  >
                    <PhotoIcon className="w-10 h-10 text-gray-300" />
                    <p className="text-xs text-gray-300">No image</p>
                  </div>
                )}

                {listing.imageUrls?.length > 1 && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage((prev) => {
                          const current = prev[listing.id] ?? 0;
                          const total = listing.imageUrls.length;
                          return {
                            ...prev,
                            [listing.id]: (current - 1 + total) % total,
                          };
                        });
                      }}
                      className="absolute left-2 top-1/2 -translate-y-1/2
                                 w-7 h-7 bg-white/90 rounded-full
                                 flex items-center justify-center
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity shadow-sm
                                 hover:bg-white"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveImage((prev) => {
                          const current = prev[listing.id] ?? 0;
                          const total = listing.imageUrls.length;
                          return {
                            ...prev,
                            [listing.id]: (current + 1) % total,
                          };
                        });
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2
                                 w-7 h-7 bg-white/90 rounded-full
                                 flex items-center justify-center
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity shadow-sm
                                 hover:bg-white"
                    >
                      <svg
                        className="w-3.5 h-3.5 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}

                {/* Image counter badge — top right */}
                {listing.imageUrls?.length > 1 && (
                  <div
                    className="absolute top-2 right-2 bg-black/50 text-white
                                  text-[10px] font-medium px-2 py-0.5
                                  rounded-full backdrop-blur-sm"
                  >
                    {(activeImage?.[listing.id] ?? 0) + 1}/
                    {listing.imageUrls.length}
                  </div>
                )}

                <div className="absolute top-2 left-2">
                  <Badge status={listing.status} />
                </div>

                {listing.imageUrls?.length > 1 && (
                  <div
                    className="absolute bottom-2 left-0 right-0
                                  flex justify-center gap-1.5"
                  >
                    {listing.imageUrls.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveImage((prev) => ({
                            ...prev,
                            [listing.id]: i,
                          }));
                        }}
                        className={clsx(
                          "w-1.5 h-1.5 rounded-full transition-all",
                          (activeImage?.[listing.id] ?? 0) === i
                            ? "bg-white w-3"
                            : "bg-white/60",
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 flex flex-col gap-3 flex-1">
                {/* Title + price row */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p
                      className="text-sm font-semibold text-gray-900
                                  truncate leading-tight"
                    >
                      {listing.title}
                    </p>
                    {listing.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                        {listing.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-forest-900">
                      KES {listing.pricePerUnit}
                    </p>
                    <p className="text-[11px] text-gray-400">
                      per {listing.unit}
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[11px] text-gray-400">Availability</p>
                    <p className="text-[11px] font-medium text-gray-600">
                      {listing.quantityAvailable} {listing.unit}
                    </p>
                  </div>
                  <div className="h-1 bg-[#f0efec] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-forest-400 rounded-full"
                      style={{
                        width: `${Math.min(
                          (listing.quantityAvailable / 500) * 100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>

                <div
                  className="flex items-center justify-between
                                pt-2 border-t border-[#f8f7f4] mt-auto"
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div
                      className="w-5 h-5 bg-forest-100 rounded-full
                                  flex items-center justify-center shrink-0"
                    >
                      <p className="text-[9px] font-semibold text-forest-800">
                        {listing.farmerName?.charAt(0).toUpperCase()}
                      </p>
                    </div>
                    <p className="text-[11px] text-gray-500 truncate">
                      {listing.farmerName}
                    </p>
                    {farmerRatings[listing.farmerId]?.totalReviews > 0 && (
                      <div className="flex items-center gap-0.5 ml-1 shrink-0">
                        <StarIcon className="w-3 h-3 text-amber-400" />
                        <span className="text-[11px] text-gray-500">
                          {farmerRatings[listing.farmerId].averageRating}
                        </span>
                      </div>
                    )}
                  </div>
                   {listing.farmerLocation && (
                  <div className="flex items-center gap-1 shrink-0">
                    <MapPinIcon className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-500 truncate max-w-[100px]">
                      {listing.farmerLocation}
                    </p>
                  </div>
                )}

                  {listing.status === "ACTIVE" &&
                    listing.farmerId !== user?.id && (
                      <button
                        onClick={() => setSelectedListing(listing)}
                        className="inline-flex items-center gap-1.5
                                 bg-forest-900 text-white text-xs
                                 font-medium px-3 py-1.5 rounded-[6px]
                                 hover:bg-forest-800 transition-colors
                                 shrink-0"
                      >
                        <ShoppingCartIcon className="w-3 h-3" />
                        Order
                      </button>
                    )}

                  {listing.farmerId === user?.id && (
                    <span
                      className="text-[11px] text-forest-600
                                     font-medium bg-forest-50 px-2 py-1
                                     rounded-[4px]"
                    >
                      Your listing
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
