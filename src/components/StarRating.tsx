import { Star } from "lucide-react";

type Props = { value: number; onChange?: (v: number) => void; size?: number };

export function StarRating({ value, onChange, size = 18 }: Props) {
  const stars = [1, 2, 3, 4, 5].map((i) => {
    const isFull = i <= value;
    const content = (
      <Star
        style={{ width: size, height: size }}
        className={isFull ? "fill-primary text-primary" : "text-warm-silver"}
        strokeWidth={1.8}
      />
    );

    if (onChange) {
      return (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i === value ? 0 : i)}
          className="transition-transform hover:scale-110 outline-none"
        >
          {content}
        </button>
      );
    }

    return (
      <span key={i} className="flex">
        {content}
      </span>
    );
  });

  return (
    <div className="flex items-center gap-0.5">
      {stars}
    </div>
  );
}
