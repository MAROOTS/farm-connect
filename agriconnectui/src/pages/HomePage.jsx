import { Link } from "react-router-dom";
import {
  ShoppingCartIcon,
  GlobeAltIcon,
  CloudIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import heroImage from "../assets/image2.jpg";

const features = [
  {
    icon: ShoppingCartIcon,
    title: "Marketplace",
    desc: "Buy and sell fresh produce directly. No middlemen, fair prices for farmers and buyers.",
  },
  {
    icon: GlobeAltIcon,
    title: "Farm management",
    desc: "Track your crops, schedule tasks, and manage your farm operations in one place.",
  },
  {
    icon: CloudIcon,
    title: "Weather advisory",
    desc: "Real-time weather data and context-aware farming tips based on your location.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure payments",
    desc: "SMS-verified payment confirmation on every order. Your money is always protected.",
  },
  {
    icon: UserGroupIcon,
    title: "Farmer network",
    desc: "Connect with buyers, suppliers, and other farmers across the region.",
  },
  {
    icon: ChartBarIcon,
    title: "Yield tracking",
    desc: "Log planting dates, expected yields, and harvest results to improve season after season.",
  },
];

const stats = [
  { value: "1+", label: "Registered farmers" },
  { value: "KES 100+", label: "Transactions processed" },
  { value: "18", label: "Counties covered" },
  { value: "10%", label: "Order fulfilment rate" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#f8f7f4] flex flex-col">

      <header className="bg-white border-b border-[#e5e7eb] sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">

          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-forest-900 rounded-[6px] flex items-center
                            justify-center shrink-0">
              <GlobeAltIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-forest-900 tracking-tight">
              <Link to="/">Agriconnect</Link>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features"
               className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Features
            </a>
            <a href="#stats"
               className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              Impact
            </a>
            <a href="#how"
               className="text-sm text-gray-500 hover:text-gray-800 transition-colors">
              How it works
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="text-sm font-medium text-forest-900 px-4 py-2 rounded-[8px]
                         hover:bg-forest-50 transition-colors"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="text-sm font-medium bg-forest-900 text-white px-4 py-2
                         rounded-[8px] hover:bg-forest-800 transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <section className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row
                        items-center gap-12">

          
          <div className="flex-1 flex flex-col items-start gap-6">
            <h1 className="text-4xl md:text-5xl font-bold text-forest-900
                           leading-tight tracking-tight">
              Grow more.<br />
              Sell better.<br />
              Farm smarter.
            </h1>

            <p className="text-base text-gray-500 max-w-md leading-relaxed">
              AgriConnect links farmers, buyers, and suppliers on one platform
              with real-time weather advisories, crop tracking, and
              SMS-verified payments.
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 bg-forest-900 text-white
                           text-sm font-medium px-5 py-2.5 rounded-[8px]
                           hover:bg-forest-800 transition-colors"
              >
                Create free account
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-transparent text-forest-900
                           text-sm font-medium px-5 py-2.5 rounded-[8px]
                           border border-[#c2d9c8] hover:bg-forest-50 transition-colors"
              >
                Sign in to dashboard
              </Link>
            </div>

            
            <div className="flex items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheckIcon className="w-4 h-4 text-forest-500" />
                <span className="text-xs text-gray-400">SMS-verified payments</span>
              </div>
              <div className="w-px h-4 bg-[#e5e7eb]"></div>
              <div className="flex items-center gap-1.5">
                <UserGroupIcon className="w-4 h-4 text-forest-500" />
                <span className="text-xs text-gray-400">2,400+ farmers</span>
              </div>
            </div>
          </div>

         
          <div className="flex-1 w-full lg:max-w-xl">
            <div className="relative rounded-[16px] overflow-hidden border border-[#e5e7eb]">
              <img
                src={heroImage}
                alt="Farmer in the field"
                className="w-full h-[420px] object-cover"
              />
              {/* Weather advisory card overlaid on image */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95
                              border border-[#e5e7eb] rounded-[10px] px-4 py-3
                              flex items-center gap-3">
                <div className="w-8 h-8 bg-forest-100 rounded-[6px] flex items-center
                                justify-center shrink-0">
                  <CloudIcon className="w-4 h-4 text-forest-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-800">
                    Today's advisory — Kiambu
                  </p>
                  <p className="text-[11px] text-gray-500">
                    22°C · Partly cloudy 
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      
      <section id="stats" className="bg-forest-900">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-white mb-1">{value}</p>
                <p className="text-sm text-forest-300">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="features" className="bg-white border-y border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-medium text-forest-600 uppercase
                          tracking-widest mb-2">
              Platform features
            </p>
            <h2 className="text-2xl font-bold text-forest-900">
              Everything a farmer needs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 border border-[#e5e7eb] rounded-[12px]
                           hover:border-forest-200 hover:bg-forest-50
                           transition-colors group"
              >
                <div className="w-9 h-9 bg-forest-100 rounded-[8px]
                                flex items-center justify-center mb-4
                                group-hover:bg-forest-200 transition-colors">
                  <Icon className="w-5 h-5 text-forest-700" />
                </div>
                <p className="text-sm font-semibold text-gray-900 mb-1.5">
                  {title}
                </p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

     
      <section id="how" className="bg-[#f8f7f4]">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="mb-10">
            <p className="text-xs font-medium text-forest-600 uppercase
                          tracking-widest mb-2">
              How it works
            </p>
            <h2 className="text-2xl font-bold text-forest-900">
              Up and running in minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Create your account",
                desc: "Register as a farmer, buyer, or supplier. We verify your email with a one-time code — no password needed.",
              },
              {
                step: "02",
                title: "Set up your profile",
                desc: "Add your farm details, location, and crop types. Buyers can then discover your produce.",
              },
              {
                step: "03",
                title: "Start trading",
                desc: "List produce, receive orders, and confirm payments via SMS code. Money moves securely.",
              },
            ].map(({ step, title, desc }) => (
              <div
                key={step}
                className="bg-white border border-[#e5e7eb] rounded-[12px] p-6"
              >
                <p className="text-3xl font-bold text-forest-200 mb-4">{step}</p>
                <p className="text-sm font-semibold text-gray-900 mb-2">{title}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      <section className="bg-forest-900">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col
                        items-center text-center gap-6">

          <div className="flex items-center gap-2">
            <DevicePhoneMobileIcon className="w-5 h-5 text-forest-300" />
            <span className="text-sm text-forest-300">
              Works on mobile, tablet, and desktop
            </span>
          </div>

          <h2 className="text-3xl font-bold text-white max-w-xl leading-tight">
            Join thousands of farmers already using AgriConnect
          </h2>

          <p className="text-forest-300 text-sm max-w-md">
            Free to sign up. No subscription fees. Pay only when you transact.
          </p>

          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-white text-forest-900
                       text-sm font-semibold px-6 py-3 rounded-[8px]
                       hover:bg-forest-50 transition-colors"
          >
            Get started free
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="bg-white border-t border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col md:flex-row
                        items-center justify-between gap-4">

          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-forest-900 rounded-[4px] flex items-center
                            justify-center">
              <GlobeAltIcon className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-forest-900">AgriConnect</span>
          </div>

          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()}Built for Kenyan agriculture.k8s group.
          </p>

          <div className="flex items-center gap-5">
            {["Privacy", "Terms", "Support"].map((item) => (
             <a 
                key={item}
                href="#"
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
