import { useState } from "react";
import {
  CloudIcon,
  SunIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { advisoryApi } from "../api/advisory";
import toast from "react-hot-toast";
import clsx from "clsx";

const KENYAN_CITIES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Kiambu",
  "Machakos",
  "Nyeri",
  "Meru",
  "Kakamega",
  "Kericho",
  "Nanyuki",
  "Kitale",
  "Garissa",
];

function AlertBadge({ level }) {
  const map = {
    NORMAL: {
      bg: "bg-forest-50 border-forest-200",
      text: "text-forest-800",
      icon: CheckCircleIcon,
      label: "Conditions normal",
    },
    CAUTION: {
      bg: "bg-amber-50 border-amber-200",
      text: "text-amber-800",
      icon: ExclamationTriangleIcon,
      label: "Exercise caution",
    },
    WARNING: {
      bg: "bg-red-50 border-red-200",
      text: "text-red-800",
      icon: ExclamationTriangleIcon,
      label: "Weather warning",
    },
  };
  const cfg = map[level] ?? map.NORMAL;
  const Icon = cfg.icon;
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        "px-3 py-1 rounded-full border",
        cfg.bg,
        cfg.text,
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
}

function WeatherStat({ label, value, unit }) {
  return (
    <div className="bg-[#f8f7f4] rounded-[8px] p-3 text-center">
      <p className="text-[11px] text-gray-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-forest-900">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-0.5">{unit}</span>
      </p>
    </div>
  );
}

export default function AdvisoryPage() {
  const [city, setCity] = useState("Nairobi");
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e) {
    e?.preventDefault();
    if (!city.trim()) return;
    setLoading(true);
    try {
      const res = await advisoryApi.getByCity(city.trim());
      setAdvisory(res.data.data);
      setSearched(true);
    } catch (err) {
      toast.error(
        err.response?.data?.message ?? `Could not fetch advisory for "${city}"`,
      );
    } finally {
      setLoading(false);
    }
  }

  // Auto-load Nairobi on mount
  useState(() => {
    handleSearch();
  }, []);

  const conditionIcon =
    advisory?.weather?.condition === "Rain" ||
    advisory?.weather?.condition === "Drizzle"
      ? "🌧️"
      : advisory?.weather?.condition === "Clouds"
        ? "☁️"
        : advisory?.weather?.condition === "Thunderstorm"
          ? "⛈️"
          : "☀️";

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Advisory</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Real-time weather data and farming tips for your location.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg">
        <div className="relative flex-1">
          <MapPinIcon
            className="absolute left-3 top-1/2
                                  -translate-y-1/2 w-4 h-4
                                  text-gray-400"
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Enter city name..."
            list="kenyan-cities"
            className="w-full pl-9 pr-3 py-2 text-sm rounded-[8px]
                       border border-[#e5e7eb] bg-white
                       focus:outline-none focus:ring-2
                       focus:ring-forest-200 focus:border-forest-400"
          />
          <datalist id="kenyan-cities">
            {KENYAN_CITIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-forest-900
                     text-white text-sm font-medium px-4 py-2
                     rounded-[8px] hover:bg-forest-800 transition-colors
                     disabled:opacity-50"
        >
          {loading ? (
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
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4" />
          )}
          {loading ? "Loading..." : "Get advisory"}
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        {KENYAN_CITIES.slice(0, 8).map((c) => (
          <button
            key={c}
            onClick={() => {
              setCity(c);
            }}
            className={clsx(
              "text-xs px-3 py-1 rounded-full border transition-colors",
              city === c
                ? "bg-forest-900 text-white border-forest-900"
                : "bg-white text-gray-500 border-[#e5e7eb] hover:border-forest-300",
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-48">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin w-8 h-8 text-forest-400"
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
            <p className="text-sm text-gray-400">Fetching weather data...</p>
          </div>
        </div>
      )}

      {!loading && advisory && (
        <div className="flex flex-col gap-4">
          <div
            className="bg-white border border-[#e5e7eb]
                          rounded-[12px] overflow-hidden"
          >
            {/* Top section */}
            <div className="px-5 py-4 border-b border-[#e5e7eb]">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="w-4 h-4 text-forest-600" />
                    <p className="text-base font-semibold text-gray-900">
                      {advisory.location}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 capitalize">
                    {advisory.weather?.description}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <AlertBadge level={advisory.alertLevel} />
                  <p className="text-4xl">{conditionIcon}</p>
                </div>
              </div>

              {/* Temperature display */}
              <div className="mt-4 flex items-end gap-2">
                <p className="text-5xl font-bold text-forest-900">
                  {Math.round(advisory.weather?.temperatureCelsius ?? 0)}
                </p>
                <p className="text-xl text-gray-400 mb-1">°C</p>
                <p className="text-sm text-gray-500 mb-1.5 ml-1">
                  {advisory.weather?.condition}
                </p>
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 p-4">
              <WeatherStat
                label="Humidity"
                value={Math.round(advisory.weather?.humidity ?? 0)}
                unit="%"
              />
              <WeatherStat
                label="Wind speed"
                value={(advisory.weather?.windSpeedMs ?? 0).toFixed(1)}
                unit="m/s"
              />
              <WeatherStat
                label="Rainfall"
                value={(advisory.weather?.rainfallMm ?? 0).toFixed(1)}
                unit="mm"
              />
            </div>
          </div>

          <div
            className={clsx(
              "flex items-start gap-3 px-4 py-3 rounded-[10px] border",
              advisory.alertLevel === "WARNING"
                ? "bg-red-50 border-red-200"
                : advisory.alertLevel === "CAUTION"
                  ? "bg-amber-50 border-amber-200"
                  : "bg-forest-50 border-forest-200",
            )}
          >
            <InformationCircleIcon
              className={clsx(
                "w-5 h-5 shrink-0 mt-0.5",
                advisory.alertLevel === "WARNING"
                  ? "text-red-600"
                  : advisory.alertLevel === "CAUTION"
                    ? "text-amber-600"
                    : "text-forest-600",
              )}
            />
            <p
              className={clsx(
                "text-sm font-medium",
                advisory.alertLevel === "WARNING"
                  ? "text-red-800"
                  : advisory.alertLevel === "CAUTION"
                    ? "text-amber-800"
                    : "text-forest-800",
              )}
            >
              {advisory.overallAdvice}
            </p>
          </div>

          <div
            className="bg-white border border-[#e5e7eb]
                          rounded-[12px] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[#e5e7eb]">
              <p className="text-sm font-semibold text-gray-800">
                Farming tips for today
              </p>
            </div>
            <div className="divide-y divide-[#f0efec]">
              {advisory.farmingTips?.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3">
                  <div
                    className="w-5 h-5 bg-forest-100 rounded-full
                                  flex items-center justify-center
                                  shrink-0 mt-0.5"
                  >
                    <p
                      className="text-[10px] font-semibold
                                  text-forest-800"
                    >
                      {i + 1}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Weather data from OpenWeatherMap · Updated every 30 minutes
          </p>
        </div>
      )}

      {!loading && !advisory && (
        <div
          className="flex flex-col items-center justify-center
                        h-48 gap-3"
        >
          <CloudIcon className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-400">
            Search for a city to get the farming advisory
          </p>
        </div>
      )}
    </div>
  );
}
