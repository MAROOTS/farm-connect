// agriconnectui/src/pages/AdvisoryPage.jsx

import { useState, useEffect } from "react";
import {
  CloudIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { advisoryApi } from "../api/advisory";
import toast from "react-hot-toast";
import clsx from "clsx";

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

function WeatherStat({ label, value, unit, icon }) {
  return (
    <div className="bg-[#f8f7f4] rounded-[10px] p-4">
      <p className="text-[11px] text-gray-400 mb-2">{label}</p>
      <p className="text-xl font-semibold text-forest-900">
        {value}
        <span className="text-sm font-normal text-gray-400 ml-1">{unit}</span>
      </p>
    </div>
  );
}

const QUICK_SEARCHES = [
  "Nairobi",
  "Mombasa",
  "Kisumu",
  "Nakuru",
  "Eldoret",
  "Thika",
  "Nyeri",
  "Meru",
  "Kericho",
  "Kitale",
  "Nanyuki",
  "Kakamega",
  "Machakos",
  "Garissa",
  "Isiolo",
];

const WEATHER_ICONS = {
  Clear: "☀️",
  Clouds: "☁️",
  Rain: "🌧️",
  Drizzle: "🌦️",
  Thunderstorm: "⛈️",
  Snow: "❄️",
  Mist: "🌫️",
  Haze: "🌫️",
  Fog: "🌫️",
  Dust: "💨",
  Sand: "💨",
  default: "🌤️",
};

export default function AdvisoryPage() {
  const [input, setInput] = useState("");
  const [city, setCity] = useState("Nairobi");
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);

  async function fetchAdvisory(searchCity) {
    if (!searchCity?.trim()) return;
    setLoading(true);
    try {
      const res = await advisoryApi.getByCity(searchCity.trim());
      setAdvisory(res.data.data);
      setCity(searchCity.trim());
    } catch (err) {
      toast.error(
        err.response?.status === 404 || err.response?.status === 503
          ? `City "${searchCity}" not found. Try a different spelling.`
          : `Could not fetch weather for "${searchCity}"`,
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAdvisory("Nairobi");
  }, []);

  function handleSearch(e) {
    e?.preventDefault();
    fetchAdvisory(input || city);
  }

  function handleQuickSearch(c) {
    setInput(c);
    fetchAdvisory(c);
  }

  const weatherEmoji = advisory
    ? (WEATHER_ICONS[advisory.weather?.condition] ?? WEATHER_ICONS.default)
    : null;

  const temp = Math.round(advisory?.weather?.temperatureCelsius ?? 0);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Weather Advisory
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Search any city worldwide for real-time farming tips.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon
            className="absolute left-3 top-1/2
                                          -translate-y-1/2 w-4 h-4
                                          text-gray-400"
          />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search any city — e.g. Kisumu, London, Kampala..."
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-[10px]
                       border border-[#e5e7eb] bg-white
                       focus:outline-none focus:ring-2
                       focus:ring-forest-200 focus:border-forest-400
                       placeholder:text-gray-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 bg-forest-900
                     text-white text-sm font-medium px-5 py-2.5
                     rounded-[10px] hover:bg-forest-800
                     transition-colors disabled:opacity-50 shrink-0"
        >
          {loading ? (
            <ArrowPathIcon className="w-4 h-4 animate-spin" />
          ) : (
            <MagnifyingGlassIcon className="w-4 h-4" />
          )}
          Search
        </button>
      </form>

      <div>
        <p className="text-xs text-gray-400 mb-2">Quick search</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_SEARCHES.map((c) => (
            <button
              key={c}
              onClick={() => handleQuickSearch(c)}
              className={clsx(
                "text-xs px-3 py-1.5 rounded-full border",
                "transition-colors",
                city === c && !loading
                  ? "bg-forest-900 text-white border-forest-900"
                  : "bg-white text-gray-600 border-[#e5e7eb]",
                "hover:border-forest-400 hover:text-forest-900",
              )}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div
          className="bg-white border border-[#e5e7eb] rounded-[16px]
                        p-12 flex flex-col items-center gap-3"
        >
          <ArrowPathIcon className="w-8 h-8 text-forest-400 animate-spin" />
          <p className="text-sm text-gray-400">
            Fetching weather for {input || city}...
          </p>
        </div>
      )}

      {!loading && advisory && (
        <div className="flex flex-col gap-4">
          <div
            className="bg-white border border-[#e5e7eb]
                          rounded-[16px] overflow-hidden"
          >
            {/* Hero section */}
            <div className="px-6 py-5 border-b border-[#f0efec]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <MapPinIcon className="w-4 h-4 text-forest-600" />
                    <p className="text-lg font-semibold text-gray-900">
                      {advisory.location}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">
                    {advisory.weather?.description}
                  </p>
                </div>
                <AlertBadge level={advisory.alertLevel} />
              </div>

              <div className="flex items-center gap-4">
                <p className="text-7xl">{weatherEmoji}</p>
                <div>
                  <div className="flex items-end gap-1">
                    <p
                      className="text-6xl font-bold text-forest-900
                                  leading-none"
                    >
                      {temp}
                    </p>
                    <p className="text-2xl text-gray-400 mb-1">°C</p>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {advisory.weather?.condition} · Feels like{" "}
                    {Math.round(advisory.weather?.temperatureCelsius ?? 0)}°C
                  </p>
                </div>
              </div>
            </div>

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
              "flex items-start gap-3 px-4 py-3.5",
              "rounded-[12px] border",
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
                "text-sm leading-relaxed",
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
                          rounded-[16px] overflow-hidden"
          >
            <div className="px-5 py-3.5 border-b border-[#e5e7eb]">
              <p className="text-sm font-semibold text-gray-800">
                Farming tips for today
              </p>
            </div>
            <div className="divide-y divide-[#f8f7f4]">
              {advisory.farmingTips?.map((tip, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-4">
                  <div
                    className="w-6 h-6 bg-forest-100 rounded-full
                                  flex items-center justify-center
                                  shrink-0 mt-0.5"
                  >
                    <p
                      className="text-[11px] font-semibold
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

          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              Data from OpenWeatherMap · Cached for 30 minutes
            </p>
            <button
              onClick={() => fetchAdvisory(city)}
              className="inline-flex items-center gap-1.5 text-xs
                         text-forest-700 hover:text-forest-900
                         transition-colors"
            >
              <ArrowPathIcon className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      )}

      {!loading && !advisory && (
        <div
          className="bg-white border border-[#e5e7eb]
                        rounded-[16px] flex flex-col items-center
                        justify-center py-16 gap-3"
        >
          <CloudIcon className="w-10 h-10 text-gray-300" />
          <p className="text-sm text-gray-400">
            Search any city to get farming advisory
          </p>
        </div>
      )}
    </div>
  );
}
