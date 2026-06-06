// agriconnectui/src/pages/FarmPage.jsx

import { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
  CalendarIcon,
  ClipboardDocumentListIcon,
  GlobeAltIcon,
  PhotoIcon,
} from "@heroicons/react/24/outline";
import { farmApi } from "../api/farm";
import { mediaApi } from "../api/media";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import clsx from "clsx";

// ── Helpers ───────────────────────────────────────────────────
const CROP_STATUSES = [
  "PLANTED",
  "GROWING",
  "READY_FOR_HARVEST",
  "HARVESTED",
  "FAILED",
];
const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const TASK_STATUSES = ["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"];

function Badge({ value, type = "crop" }) {
  const cropMap = {
    PLANTED: "bg-blue-100 text-blue-700",
    GROWING: "bg-forest-100 text-forest-800",
    READY_FOR_HARVEST: "bg-amber-100 text-amber-700",
    HARVESTED: "bg-gray-100 text-gray-500",
    FAILED: "bg-red-100 text-red-700",
  };
  const taskMap = {
    PENDING: "bg-amber-100 text-amber-700",
    IN_PROGRESS: "bg-blue-100 text-blue-700",
    COMPLETED: "bg-forest-100 text-forest-800",
    OVERDUE: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-500",
  };
  const priorityMap = {
    LOW: "bg-gray-100 text-gray-500",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-amber-100 text-amber-700",
    URGENT: "bg-red-100 text-red-700",
  };
  const map =
    type === "priority" ? priorityMap : type === "task" ? taskMap : cropMap;
  const label = value
    ?.replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
  return (
    <span
      className={clsx(
        "inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full",
        map[value] ?? "bg-gray-100 text-gray-500",
      )}
    >
      {label}
    </span>
  );
}

// ── Register / Edit farm modal ────────────────────────────────
function FarmModal({ farm, onClose, onSaved }) {
  const [form, setForm] = useState({
    farmName: farm?.farmName ?? "",
    location: farm?.location ?? "",
    sizeInAcres: farm?.sizeInAcres ?? "",
    soilType: farm?.soilType ?? "",
    cropTypes: farm?.cropTypes?.join(", ") ?? "",
    farmImageUrl: farm?.farmImageUrl ?? "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(farm?.farmImageUrl ?? null);
  const [loading, setLoading] = useState(false);

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
    if (!form.farmName || !form.location || !form.sizeInAcres) {
      toast.error("Farm name, location and size are required");
      return;
    }
    setLoading(true);
    try {
      let imageUrl = form.farmImageUrl;
      if (imageFile) {
        const res = await mediaApi.uploadFarmImage(imageFile);
        imageUrl = res.data.data.imageUrl;
      }
      const payload = {
        ...form,
        sizeInAcres: parseFloat(form.sizeInAcres),
        cropTypes: form.cropTypes
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        farmImageUrl: imageUrl,
      };
      if (farm) {
        await farmApi.updateFarm(payload);
        toast.success("Farm updated!");
      } else {
        await farmApi.registerFarm(payload);
        toast.success("Farm registered!");
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to save farm");
    } finally {
      setLoading(false);
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
        <div
          className="flex items-center justify-between px-6 py-4
                        border-b border-[#e5e7eb] sticky top-0 bg-white"
        >
          <h2 className="text-base font-semibold text-gray-900">
            {farm ? "Edit farm" : "Register your farm"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-gray-100
                             text-gray-400"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {/* Farm image */}
          <label
            className={clsx(
              "w-full h-28 border-2 border-dashed rounded-[10px]",
              "flex flex-col items-center justify-center cursor-pointer",
              "transition-colors overflow-hidden",
              imagePreview
                ? "border-forest-300"
                : "border-[#e5e7eb] hover:border-forest-300 hover:bg-forest-50",
            )}
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="farm"
                className="w-full h-full object-cover"
              />
            ) : (
              <>
                <PhotoIcon className="w-7 h-7 text-gray-300 mb-1" />
                <p className="text-xs text-gray-400">Upload farm photo</p>
              </>
            )}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
          </label>

          {/* Farm name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Farm name <span className="text-red-400">*</span>
            </label>
            <input
              name="farmName"
              value={form.farmName}
              onChange={handleChange}
              required
              placeholder="e.g. Kamau Family Farm"
              className="w-full px-3 py-2 text-sm rounded-[8px]
                              border border-[#e5e7eb] focus:outline-none
                              focus:ring-2 focus:ring-forest-200
                              focus:border-forest-400"
            />
          </div>

          {/* Location */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Location <span className="text-red-400">*</span>
            </label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              required
              placeholder="e.g. Kiambu, Kenya"
              className="w-full px-3 py-2 text-sm rounded-[8px]
                              border border-[#e5e7eb] focus:outline-none
                              focus:ring-2 focus:ring-forest-200
                              focus:border-forest-400"
            />
          </div>

          {/* Size + soil type */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Size (acres) <span className="text-red-400">*</span>
              </label>
              <input
                name="sizeInAcres"
                value={form.sizeInAcres}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.1"
                required
                placeholder="5.0"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Soil type
              </label>
              <select
                name="soilType"
                value={form.soilType}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] bg-white
                                 focus:outline-none focus:ring-2
                                 focus:ring-forest-200
                                 focus:border-forest-400"
              >
                <option value="">Select...</option>
                {["Loam", "Clay", "Sandy", "Silt", "Peat", "Chalk"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Crop types */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Crop types (comma separated)
            </label>
            <input
              name="cropTypes"
              value={form.cropTypes}
              onChange={handleChange}
              placeholder="e.g. Maize, Beans, Tomatoes"
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
              className="flex-1 bg-forest-900 text-white text-sm
                               font-medium py-2.5 rounded-[8px]
                               hover:bg-forest-800 transition-colors
                               disabled:opacity-50"
            >
              {loading ? "Saving..." : farm ? "Save changes" : "Register farm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add crop modal ────────────────────────────────────────────
function AddCropModal({ farmId, onClose, onAdded }) {
  const [form, setForm] = useState({
    farmId,
    cropName: "",
    variety: "",
    plantedAreaAcres: "",
    plantingDate: "",
    expectedHarvestDate: "",
    expectedYieldKg: "",
    notes: "",
    status: "PLANTED",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.cropName || !form.plantedAreaAcres || !form.plantingDate) {
      toast.error("Crop name, area and planting date are required");
      return;
    }
    setLoading(true);
    try {
      await farmApi.addCrop({
        ...form,
        plantedAreaAcres: parseFloat(form.plantedAreaAcres),
        expectedYieldKg: form.expectedYieldKg
          ? parseFloat(form.expectedYieldKg)
          : null,
      });
      toast.success("Crop added!");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to add crop");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div
          className="flex items-center justify-between px-5 py-4
                        border-b border-[#e5e7eb] sticky top-0 bg-white"
        >
          <h2 className="text-base font-semibold text-gray-900">Add crop</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-gray-100
                             text-gray-400"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Crop name <span className="text-red-400">*</span>
              </label>
              <input
                name="cropName"
                value={form.cropName}
                onChange={handleChange}
                required
                placeholder="e.g. Maize"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Variety
              </label>
              <input
                name="variety"
                value={form.variety}
                onChange={handleChange}
                placeholder="e.g. H614D"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Area (acres) <span className="text-red-400">*</span>
              </label>
              <input
                name="plantedAreaAcres"
                value={form.plantedAreaAcres}
                onChange={handleChange}
                type="number"
                min="0"
                step="0.1"
                required
                placeholder="2.5"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Expected yield (kg)
              </label>
              <input
                name="expectedYieldKg"
                value={form.expectedYieldKg}
                onChange={handleChange}
                type="number"
                min="0"
                placeholder="500"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Planting date <span className="text-red-400">*</span>
              </label>
              <input
                name="plantingDate"
                value={form.plantingDate}
                onChange={handleChange}
                type="date"
                required
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Expected harvest
              </label>
              <input
                name="expectedHarvestDate"
                value={form.expectedHarvestDate}
                onChange={handleChange}
                type="date"
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-[8px]
                               border border-[#e5e7eb] bg-white
                               focus:outline-none focus:ring-2
                               focus:ring-forest-200
                               focus:border-forest-400"
            >
              {CROP_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s
                    .replace(/_/g, " ")
                    .toLowerCase()
                    .replace(/^\w/, (c) => c.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              rows={2}
              placeholder="Any additional notes..."
              className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] focus:outline-none
                                 focus:ring-2 focus:ring-forest-200
                                 focus:border-forest-400 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
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
              className="flex-1 bg-forest-900 text-white text-sm
                               font-medium py-2.5 rounded-[8px]
                               hover:bg-forest-800 transition-colors
                               disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add crop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Add task modal ────────────────────────────────────────────
function AddTaskModal({ farmId, onClose, onAdded }) {
  const [form, setForm] = useState({
    farmId,
    title: "",
    description: "",
    priority: "MEDIUM",
    dueDate: "",
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title || !form.dueDate) {
      toast.error("Title and due date are required");
      return;
    }
    setLoading(true);
    try {
      await farmApi.createTask(form);
      toast.success("Task created!");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Failed to create task");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                    bg-black/40 px-4"
    >
      <div
        className="bg-white rounded-[16px] border border-[#e5e7eb]
                      w-full max-w-md"
      >
        <div
          className="flex items-center justify-between px-5 py-4
                        border-b border-[#e5e7eb]"
        >
          <h2 className="text-base font-semibold text-gray-900">Add task</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-[6px] hover:bg-gray-100
                             text-gray-400"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-gray-600">
              Task title <span className="text-red-400">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              autoFocus
              placeholder="e.g. Apply fertilizer to maize"
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
              placeholder="Details about this task..."
              className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] focus:outline-none
                                 focus:ring-2 focus:ring-forest-200
                                 focus:border-forest-400 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                 border border-[#e5e7eb] bg-white
                                 focus:outline-none focus:ring-2
                                 focus:ring-forest-200
                                 focus:border-forest-400"
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-gray-600">
                Due date <span className="text-red-400">*</span>
              </label>
              <input
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                type="date"
                required
                className="w-full px-3 py-2 text-sm rounded-[8px]
                                border border-[#e5e7eb] focus:outline-none
                                focus:ring-2 focus:ring-forest-200
                                focus:border-forest-400"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
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
              className="flex-1 bg-forest-900 text-white text-sm
                               font-medium py-2.5 rounded-[8px]
                               hover:bg-forest-800 transition-colors
                               disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main FarmPage ─────────────────────────────────────────────
export default function FarmPage() {
  const user = useAuthStore((s) => s.user);
  const [farm, setFarm] = useState(null);
  const [crops, setCrops] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("crops");
  const [showFarmModal, setShowFarmModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [completing, setCompleting] = useState(null);
  const [updatingCrop, setUpdatingCrop] = useState(null);

  async function loadAll() {
    try {
      const results = await Promise.allSettled([
        farmApi.getMyFarm(),
        farmApi.getMyCrops(),
        farmApi.getMyTasks(),
        farmApi.getOverdue(),
      ]);
      if (results[0].status === "fulfilled")
        setFarm(results[0].value.data.data);
      if (results[1].status === "fulfilled")
        setCrops(results[1].value.data.data ?? []);
      if (results[2].status === "fulfilled")
        setTasks(results[2].value.data.data ?? []);
      if (results[3].status === "fulfilled")
        setOverdue(results[3].value.data.data ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function handleCompleteTask(taskId) {
    setCompleting(taskId);
    try {
      await farmApi.completeTask(taskId);
      toast.success("Task marked as complete!");
      loadAll();
    } catch {
      toast.error("Failed to complete task");
    } finally {
      setCompleting(null);
    }
  }

  async function handleUpdateCropStatus(cropId, status) {
    setUpdatingCrop(cropId);
    try {
      await farmApi.updateCrop(cropId, status);
      toast.success("Crop status updated!");
      loadAll();
    } catch {
      toast.error("Failed to update crop status");
    } finally {
      setUpdatingCrop(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-400">Loading farm data...</p>
      </div>
    );
  }

  // ── No farm registered yet ────────────────────────────────
  if (!farm) {
    return (
      <>
        <div
          className="flex flex-col items-center justify-center
                        h-64 gap-4 text-center"
        >
          <div
            className="w-14 h-14 bg-forest-100 rounded-[12px]
                          flex items-center justify-center"
          >
            <GlobeAltIcon className="w-7 h-7 text-forest-700" />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 mb-1">
              Register your farm
            </p>
            <p className="text-sm text-gray-500 max-w-xs">
              Set up your farm profile to start tracking crops, managing tasks,
              and getting advisory tips.
            </p>
          </div>
          <button
            onClick={() => setShowFarmModal(true)}
            className="inline-flex items-center gap-2 bg-forest-900
                             text-white text-sm font-medium px-4 py-2.5
                             rounded-[8px] hover:bg-forest-800
                             transition-colors"
          >
            <PlusIcon className="w-4 h-4" />
            Register farm
          </button>
        </div>
        {showFarmModal && (
          <FarmModal
            onClose={() => setShowFarmModal(false)}
            onSaved={loadAll}
          />
        )}
      </>
    );
  }

  const pendingTasks = tasks.filter(
    (t) => t.status !== "COMPLETED" && t.status !== "CANCELLED",
  );

  return (
    <div className="flex flex-col gap-5">
      {/* ── Farm profile card ──────────────────────────────── */}
      <div
        className="bg-white border border-[#e5e7eb]
                      rounded-[12px] overflow-hidden"
      >
        <div className="flex">
          {/* Farm image */}
          <div
            className="w-32 h-32 shrink-0 bg-[#f8f7f4]
                          flex items-center justify-center overflow-hidden"
          >
            {farm.farmImageUrl ? (
              <img
                src={farm.farmImageUrl}
                alt={farm.farmName}
                className="w-full h-full object-cover"
              />
            ) : (
              <GlobeAltIcon className="w-10 h-10 text-gray-300" />
            )}
          </div>

          {/* Farm details */}
          <div className="flex-1 px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">
                  {farm.farmName}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <MapPinIcon className="w-3.5 h-3.5 text-gray-400" />
                  <p className="text-xs text-gray-500">{farm.location}</p>
                </div>
              </div>
              <button
                onClick={() => setShowFarmModal(true)}
                className="inline-flex items-center gap-1.5 text-xs
                                 text-gray-500 border border-[#e5e7eb]
                                 px-3 py-1.5 rounded-[6px]
                                 hover:bg-gray-50 transition-colors"
              >
                <PencilIcon className="w-3 h-3" />
                Edit
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-[11px] text-gray-400">Size</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {farm.sizeInAcres} acres
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Soil type</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {farm.soilType || "—"}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-gray-400">Crop types</p>
                <p
                  className="text-sm font-medium text-gray-800 mt-0.5
                              truncate"
                >
                  {farm.cropTypes?.join(", ") || "—"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="grid grid-cols-3 border-t border-[#e5e7eb]
                        divide-x divide-[#e5e7eb]"
        >
          {[
            { label: "Total crops", value: crops.length },
            {
              label: "Active crops",
              value: crops.filter(
                (c) => c.status === "GROWING" || c.status === "PLANTED",
              ).length,
            },
            { label: "Pending tasks", value: pendingTasks.length },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3 text-center">
              <p className="text-lg font-semibold text-forest-900">{value}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Overdue alert ──────────────────────────────────── */}
      {overdue.length > 0 && (
        <div
          className="flex items-start gap-3 bg-amber-50 border
                        border-amber-200 rounded-[10px] px-4 py-3"
        >
          <ExclamationTriangleIcon
            className="w-4 h-4 text-amber-600
                                              shrink-0 mt-0.5"
          />
          <div>
            <p className="text-sm font-medium text-amber-800">
              {overdue.length} overdue task
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
        </div>
      )}

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-1 bg-[#f8f7f4]
                        rounded-[8px] p-1"
        >
          {[
            { id: "crops", label: `Crops (${crops.length})` },
            { id: "tasks", label: `Tasks (${pendingTasks.length})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={clsx(
                "text-xs font-medium px-3 py-1.5 rounded-[6px]",
                "transition-colors",
                activeTab === t.id
                  ? "bg-white text-forest-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() =>
            activeTab === "crops"
              ? setShowCropModal(true)
              : setShowTaskModal(true)
          }
          className="inline-flex items-center gap-2 bg-forest-900
                     text-white text-xs font-medium px-3 py-2
                     rounded-[8px] hover:bg-forest-800 transition-colors"
        >
          <PlusIcon className="w-3.5 h-3.5" />
          {activeTab === "crops" ? "Add crop" : "Add task"}
        </button>
      </div>

      {/* ── Crops table ────────────────────────────────────── */}
      {activeTab === "crops" && (
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          {crops.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <GlobeAltIcon className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">No crops added yet</p>
              <button
                onClick={() => setShowCropModal(true)}
                className="text-xs text-forest-700 font-medium
                                 hover:underline"
              >
                Add your first crop →
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#e5e7eb]">
                  {["Crop", "Area", "Planted", "Harvest", "Status", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-2.5 text-left text-[11px]
                                   font-medium text-gray-400"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0efec]">
                {crops.map((crop) => (
                  <tr
                    key={crop.id}
                    className="hover:bg-[#fafaf9] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">
                        {crop.cropName}
                      </p>
                      {crop.variety && (
                        <p className="text-[11px] text-gray-400">
                          {crop.variety}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {crop.plantedAreaAcres} ac
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {crop.plantingDate
                        ? new Date(crop.plantingDate).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {crop.expectedHarvestDate
                        ? new Date(crop.expectedHarvestDate).toLocaleDateString(
                            "en-KE",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge value={crop.status} type="crop" />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={crop.status}
                        disabled={updatingCrop === crop.id}
                        onChange={(e) =>
                          handleUpdateCropStatus(crop.id, e.target.value)
                        }
                        className="text-xs border border-[#e5e7eb]
                                   rounded-[6px] px-2 py-1 bg-white
                                   text-gray-600 focus:outline-none
                                   focus:ring-1 focus:ring-forest-200
                                   disabled:opacity-50"
                      >
                        {CROP_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s
                              .replace(/_/g, " ")
                              .toLowerCase()
                              .replace(/^\w/, (c) => c.toUpperCase())}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Tasks list ─────────────────────────────────────── */}
      {activeTab === "tasks" && (
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[12px] overflow-hidden"
        >
          {tasks.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3">
              <ClipboardDocumentListIcon className="w-8 h-8 text-gray-300" />
              <p className="text-sm text-gray-400">No tasks yet</p>
              <button
                onClick={() => setShowTaskModal(true)}
                className="text-xs text-forest-700 font-medium
                                 hover:underline"
              >
                Create your first task →
              </button>
            </div>
          ) : (
            <div className="divide-y divide-[#f0efec]">
              {tasks.map((task) => {
                const isOverdue = overdue.some((o) => o.id === task.id);
                return (
                  <div
                    key={task.id}
                    className={clsx(
                      "flex items-start gap-3 px-4 py-3",
                      "hover:bg-[#fafaf9] transition-colors",
                      isOverdue && "bg-amber-50/50",
                    )}
                  >
                    {/* Complete button */}
                    <button
                      disabled={
                        task.status === "COMPLETED" ||
                        task.status === "CANCELLED" ||
                        completing === task.id
                      }
                      onClick={() => handleCompleteTask(task.id)}
                      className={clsx(
                        "mt-0.5 w-5 h-5 rounded-full border-2 shrink-0",
                        "flex items-center justify-center transition-colors",
                        task.status === "COMPLETED"
                          ? "bg-forest-700 border-forest-700"
                          : isOverdue
                            ? "border-amber-400 hover:bg-amber-100"
                            : "border-[#d1d5db] hover:border-forest-400",
                      )}
                    >
                      {task.status === "COMPLETED" && (
                        <CheckIcon className="w-3 h-3 text-white" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p
                          className={clsx(
                            "text-sm font-medium",
                            task.status === "COMPLETED"
                              ? "text-gray-400 line-through"
                              : "text-gray-800",
                          )}
                        >
                          {task.title}
                        </p>
                        <Badge value={task.priority} type="priority" />
                        {isOverdue && (
                          <span
                            className="text-[11px] font-medium
                                           text-amber-600"
                          >
                            Overdue
                          </span>
                        )}
                      </div>
                      {task.description && (
                        <p className="text-xs text-gray-400 mt-0.5">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-1">
                        <CalendarIcon className="w-3 h-3 text-gray-300" />
                        <p className="text-[11px] text-gray-400">
                          Due{" "}
                          {new Date(task.dueDate).toLocaleDateString("en-KE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <Badge value={task.status} type="task" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── Modals ──────────────────────────────────────────── */}
      {showFarmModal && (
        <FarmModal
          farm={farm}
          onClose={() => setShowFarmModal(false)}
          onSaved={loadAll}
        />
      )}
      {showCropModal && farm && (
        <AddCropModal
          farmId={farm.id}
          onClose={() => setShowCropModal(false)}
          onAdded={loadAll}
        />
      )}
      {showTaskModal && farm && (
        <AddTaskModal
          farmId={farm.id}
          onClose={() => setShowTaskModal(false)}
          onAdded={loadAll}
        />
      )}
    </div>
  );
}
