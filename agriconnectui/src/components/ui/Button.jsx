import clsx from "clsx";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  loading,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-[8px] transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-forest-900 text-white hover:bg-forest-800 active:bg-forest-950",
    ghost:
      "bg-transparent text-forest-900 border border-forest-900 hover:bg-forest-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    soft: "bg-forest-100 text-forest-900 hover:bg-forest-200",
  };

  const sizes = {
    sm: "text-xs px-3 py-1.5",
    md: "text-sm px-4 py-2",
    lg: "text-sm px-5 py-2.5",
  };

  return (
    <button
      className={clsx(base, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
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
      )}
      {children}
    </button>
  );
}
