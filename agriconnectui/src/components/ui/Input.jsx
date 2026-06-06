import clsx from "clsx";

export default function Input({ label, error, className, ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-xs font-medium text-gray-600">{label}</label>
      )}
      <input
        className={clsx(
          "w-full px-3 py-2 text-sm rounded-[8px] border border-[#e5e7eb]",
          "bg-white text-gray-900 placeholder:text-gray-400",
          "focus:outline-none focus:ring-2 focus:ring-forest-200 focus:border-forest-400",
          "transition-colors",
          error && "border-red-400 focus:ring-red-100",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
