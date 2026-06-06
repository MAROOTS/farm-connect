import clsx from "clsx";

const variants = {
  green: "bg-forest-100 text-forest-900",
  amber: "bg-amber-100 text-amber-800",
  red: "bg-red-100 text-red-800",
  gray: "bg-gray-100 text-gray-700",
  blue: "bg-blue-100 text-blue-800",
};

export default function Badge({ children, variant = "gray", className }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center text-[11px] font-medium px-2.5 py-0.5 rounded-full",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
