type FlameRatingFieldProps = {
  hint: string;
  label: string;
  value: number;
  hoverValue?: number;
  onChange: (value: number) => void;
  onHover?: (value: number) => void;
};

export function FlameRatingField({
  hint,
  label,
  value,
  hoverValue = 0,
  onChange,
  onHover
}: FlameRatingFieldProps) {
  const displayedValue = hoverValue || value;

  return (
    <div className="field">
      <label>
        {label} <span className="label-hint">— {hint}</span>
      </label>
      <div className="flame-rating" onMouseLeave={() => onHover?.(0)}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map((rating) => (
          <button
            key={rating}
            className={rating <= displayedValue ? "flame-btn lit" : "flame-btn"}
            type="button"
            onMouseEnter={() => onHover?.(rating)}
            onClick={() => onChange(rating)}
            aria-label={`${label} rating ${rating}`}
            aria-pressed={rating === value}
          >
            🔥
          </button>
        ))}
      </div>
    </div>
  );
}
