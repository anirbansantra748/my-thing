import { Star } from "lucide-react";

type Props = { value: number; onChange?: (v: number) => void; size?: number };

export function StarRating({ value, onChange, size = 18 }: Props) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange?.(i === value ? 0 : i)}
          disabled={!onChange}
          className={onChange ? "transition-transform hover:scale-110" : ""}
        >
          <Star
            style={{ width: size, height: size }}
            className={i <= value ? "fill-primary text-primary" : "text-warm-silver"}
            strokeWidth={1.8}
          />
        </button>
      ))}
    </div>
  );
}
