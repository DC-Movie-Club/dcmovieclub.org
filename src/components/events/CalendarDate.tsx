import { cn } from "@/lib/utils";

const CALENDAR_VARIANTS = {
  tall: {
    key: "tall",
    width: "w-18 sm:w-22",
    radius: "rounded-lg",
    border: "border-[2.5px]",
    shadow: "translate-x-1 translate-y-1",
    direction: "flex-col",
    strip: "h-8 sm:h-9",
    month: "h-8 pt-0.5 text-base sm:h-9 sm:text-lg",
    day: "py-2 text-center text-4xl sm:text-5xl",
  },
  wide: {
    key: "wide",
    width: "w-fit",
    radius: "rounded",
    border: "border-[1.5px]",
    shadow: null,
    direction: "flex-row",
    strip: "w-9",
    month: "w-9 text-[11px]",
    day: "flex items-center px-1.5 pt-1.5 pb-0.5 text-sm",
  },
} as const;

export function CalendarDate({
  month,
  day,
  variant,
  className,
}: {
  month: string;
  day: string;
  variant: keyof typeof CALENDAR_VARIANTS;
  className?: string;
}) {
  const v = CALENDAR_VARIANTS[variant];

  return (
    <div className={cn("relative shrink-0", v.width, className)}>
      {v.shadow && (
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 bg-charcoal sketch-subtle",
            v.radius,
            v.shadow,
          )}
        />
      )}
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 flex overflow-hidden border-charcoal bg-cream sketch-subtle",
          v.direction,
          v.radius,
          v.border,
        )}
      >
        <div className={cn("bg-rust", v.strip)} />
      </div>
      {/* Transparent border matches the face's border so the month text
          lines up with the rust strip inside it. */}
      <div
        className={cn("relative flex border-transparent", v.direction, v.border)}
      >
        <span
          className={cn(
            "flex items-center justify-center leading-none uppercase tracking-widest text-cream",
            v.month,
          )}
        >
          {month}
        </span>
        <span className={cn("leading-none text-charcoal", v.day)}>{day}</span>
      </div>
    </div>
  );
}
