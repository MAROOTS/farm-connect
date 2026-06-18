import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarOutline } from "@heroicons/react/24/outline";
import { useState } from "react";
import clsx from "clsx";

export default function StarRating({
  value = 0,
  onChange,
  size = "md",
  interactive = false,
}) {
  const [hover, setHover] = useState(0);

  const sizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const displayValue = interactive && hover > 0 ? hover : value;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= displayValue;
        const Icon = filled ? StarIcon : StarOutline;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHover(star)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onChange?.(star)}
            className={clsx(
              interactive && "cursor-pointer hover:scale-110",
              "transition-transform"
            )}
          >
            <Icon className={clsx(
              sizes[size],
              filled ? "text-amber-400" : "text-gray-300"
            )} />
          </button>
        );
      })}
    </div>
  );
}
