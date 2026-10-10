import type { ReactElement } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { SketchShape, type SketchWeight } from "@/components/system/SketchShape";
import { SmartLink } from "@/components/system/SmartLink";
import { textStyles } from "@/components/system/textStyles";

// The button looks: filled in the page's accent, outlined or ghosted in its
// text color, or cream on any page for small controls on cream (a dialog's
// close, Read more)
const VARIANTS = {
  accent: {
    key: "accent",
    weight: "bold",
    fill: "bg-page-accent",
    shadow: "shadow-lg",
    line: "border-page-accent-edge",
    text: "text-page-accent-text",
    focus: null,
    pad: null,
  },
  // Fills in with the text color on hover, the text taking the background's
  outline: {
    key: "outline",
    weight: "fine",
    fill: "transition-colors parent-hover:bg-page-fg",
    shadow: null,
    line: "border-page-fg opacity-70 transition-opacity parent-hover:opacity-100",
    text: "text-page-fg transition-colors parent-hover:text-page-bg",
    focus: null,
    pad: null,
  },
  // No line, only a tint on hover. With nothing drawn around the label, the
  // padding only shows as that tint, so it hugs the label at any size.
  ghost: {
    key: "ghost",
    weight: "fine",
    fill: "transition-colors parent-hover:bg-page-fg/10",
    shadow: null,
    line: null,
    text: "text-page-fg",
    focus: null,
    pad: "px-2.5 py-2",
  },
  cream: {
    key: "cream",
    weight: "fine",
    fill: "bg-cream",
    shadow: "shadow-md",
    line: "border-charcoal opacity-25 transition-opacity parent-hover:opacity-40",
    text: "text-charcoal",
    focus: "focus-ring-rust",
    pad: null,
  },
} as const satisfies Record<
  string,
  {
    key: string;
    weight: SketchWeight;
    fill: string;
    shadow: string | null;
    line: string | null;
    text: string;
    focus: string | null;
    // Padding in place of the size's
    pad: string | null;
  }
>;

const LINE_WIDTHS = { bold: "border-[3px]", fine: "border-2" } as const;

const SIZES = {
  sm: {
    key: "sm",
    pad: "px-4 py-1.5",
    label: cn("gap-1", textStyles.buttonSmall),
    icon: 14,
    round: "size-8",
    roundIcon: 16,
  },
  md: {
    key: "md",
    pad: "px-4 py-2",
    label: cn("gap-1.5", textStyles.button),
    icon: 16,
    round: "size-10",
    roundIcon: 18,
  },
  lg: {
    key: "lg",
    pad: "px-5 py-2.5 sm:px-6 sm:py-3",
    label: cn("gap-2", textStyles.buttonLarge),
    icon: 18,
    round: "size-12",
    roundIcon: 20,
  },
} as const;

type FaceProps = { className?: string; children?: React.ReactNode };

export type PillProps = {
  variant: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  // An icon alone in a circle, drawn in the fine line
  round?: boolean;
  icon?: LucideIcon;
  iconEnd?: LucideIcon;
  iconClassName?: string;
  // Also boils and grows while the card it sits on (a group/card) is hovered
  withCard?: boolean;
  // Drawn for show inside another control, as a <span> with no hover or focus
  // of its own
  decorative?: boolean;
  // A link, or else a <button>
  href?: string;
  // An element to render as instead (like EventCtaLink), given the pill's
  // class and face
  render?: ReactElement<FaceProps>;
  className?: string;
  children?: React.ReactNode;
} & Omit<React.HTMLAttributes<HTMLElement>, "className" | "children"> & {
    ref?: React.Ref<HTMLElement>;
  };

// A hand-drawn button. It boils and grows a little while hovered or pressed,
// and works as a Base UI `render` element, since it passes on the props and
// ref it's given. Give it its content directly there: a Pill made in a server
// component arrives drawn, so content given to the Base UI part is dropped.
export function Pill({
  variant: variantKey,
  size: sizeKey = "md",
  round,
  icon: Icon,
  iconEnd: IconEnd,
  iconClassName,
  withCard,
  decorative,
  href,
  render,
  className,
  children,
  ref,
  ...props
}: PillProps) {
  const variant = VARIANTS[variantKey];
  const size = SIZES[sizeKey];
  const weight = round ? "fine" : variant.weight;

  const face = (
    <>
      <SketchShape
        weight={weight}
        fill={cn(variant.fill, !decorative && variant.shadow)}
        line={variant.line ? cn(LINE_WIDTHS[weight], variant.line) : undefined}
        hover={cn("parent-hover:boil", withCard && "card-hover:boil")}
      />
      {round ? (
        Icon && (
          <Icon
            size={size.roundIcon}
            strokeWidth={2.5}
            className={cn("relative", iconClassName)}
          />
        )
      ) : (
        <span
          className={cn(
            "relative flex items-center",
            variant.pad ?? size.pad,
            size.label,
            variant.text,
          )}
        >
          {Icon && <Icon size={size.icon} className={cn("shrink-0", iconClassName)} />}
          {children}
          {IconEnd && <IconEnd size={size.icon} className="shrink-0" />}
        </span>
      )}
    </>
  );

  const rootClassName = cn(
    "relative flex w-fit shrink-0 rounded-full",
    round && cn("items-center justify-center", size.round, variant.text),
    !decorative && cn("transition-transform hover:scale-105 focus-ring", variant.focus),
    !decorative && withCard && "card-hover:scale-105",
    className,
  );

  if (render) {
    const Render = render.type as React.ElementType;
    return (
      <Render
        {...render.props}
        {...props}
        ref={ref}
        className={cn(rootClassName, render.props.className)}
      >
        {face}
      </Render>
    );
  }
  if (decorative) {
    return (
      <span {...props} ref={ref as React.Ref<HTMLSpanElement>} className={rootClassName}>
        {face}
      </span>
    );
  }
  if (href) {
    return (
      <SmartLink
        href={href}
        {...props}
        ref={ref as React.Ref<HTMLAnchorElement>}
        className={rootClassName}
      >
        {face}
      </SmartLink>
    );
  }
  return (
    <button
      type="button"
      {...props}
      ref={ref as React.Ref<HTMLButtonElement>}
      className={rootClassName}
    >
      {face}
    </button>
  );
}

// An accent pill straddling the top-right corner of a card, which boils and
// grows with the card while it's hovered. Half on the page, it keeps the
// page's focus ring, not the card's.
export function CardAction({
  className,
  ...props
}: Omit<PillProps, "variant" | "size" | "withCard">) {
  return (
    <Pill
      variant="accent"
      size="lg"
      withCard
      className={cn(
        "absolute top-0 right-4 z-10 -translate-y-1/2 [--focus-ring:initial] sm:right-6",
        className,
      )}
      {...props}
    />
  );
}
