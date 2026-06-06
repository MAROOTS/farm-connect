import clsx from "clsx";

export default function Card({ children, className, ...props }) {
  return (
    <div
      className={clsx(
        "bg-white border border-[#e5e7eb] rounded-[12px] p-4",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
