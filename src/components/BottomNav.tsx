"use client";

import {
  forwardRef,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Ellipsis, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes, socials } from "@/config/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const menuRoutes = [routes.about];
const NAV_LOGO_SIZE = 112;

const ICON_SIZE = "size-7 xs:size-8";
const LABEL_SIZE = "text-[9px] xs:text-[11px]";
const ITEM_PADDING = "px-2 py-1 xs:px-3 xs:py-1.5";
const LOGO_SIZE = "size-24 -top-8 xs:size-28 xs:-top-8";
const LOGO_SPACER = "w-[88px] xs:w-[120px]";

// The pill's hard shadow, in px. It's deep enough to hold the hatching.
const SHADOW_X = 6;
const SHADOW_Y = 8;
const HATCH_GAP = 5.5;
const HATCH_WIDTH = 1.6;
// How far the hatching stops short of the shadow's edge and the pill's edge
const HATCH_INSET = 1.75;
const HATCH_CLEARANCE = 1.5;

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 animate-nav-spring-in select-none motion-reduce:animate-none xs:bottom-6 xs:left-1/2 xs:right-auto xs:-translate-x-1/2">
      {/* Grows a touch on hover, with the same spring as its entrance */}
      <div className="relative flex items-center justify-center gap-4 px-4 py-2 transition-[scale] duration-300 ease-[cubic-bezier(0.3,1.35,0.5,1)] xs:px-6 xs:py-3 xs:hover:scale-[1.03]">
        {/* Full-width on phones, the bar runs past the screen edges so the
            sketch filter's wobble can't open a gap along them. The wrapper
            clips that overhang without clipping the logo. */}
        <div className="absolute inset-x-0 -top-2 -bottom-2 overflow-hidden xs:inset-0 xs:overflow-visible">
          <div className="absolute -inset-x-2 top-2 bottom-0 xs:inset-0">
            <PillShadow />
            {/* The fill sits just inside the line, which the ink filter thins
                in places, so it never shows past the line's outer edge */}
            <div className="absolute inset-x-0 top-px bottom-0 bg-surface sketch xs:inset-px xs:rounded-full" />
            <div className="absolute inset-0 border-t-2 border-charcoal ink xs:rounded-full xs:border-2" />
          </div>
        </div>
        <NavLink
          route={routes.blog}
          active={pathname === routes.blog.href}
        />

        <NavLink
          route={routes.events}
          active={pathname === routes.events.href}
        />

        <div className={LOGO_SPACER} />

        <NavLink
          route={routes.partnerships}
          active={pathname === routes.partnerships.href}
        />

        <Dialog>
          <DialogTrigger render={<NavButton icon={Ellipsis} label="More" />} />
          <DialogContent showCloseButton={false}>
            <DialogTitle className="sr-only">More</DialogTitle>
            <ul className="flex flex-col gap-1">
              {menuRoutes.map((route, i) => {
                const Icon = route.icon;
                const active = pathname === route.href;
                return (
                  <li key={route.key}>
                    <DialogClose
                      nativeButton={false}
                      render={
                        <Link
                          href={route.href}
                          className={cn(
                            "group/item flex items-center gap-3 rounded-lg px-4 py-3 transition-colors",
                            active
                              ? "text-rust"
                              : "text-foreground hover:text-rust",
                          )}
                        />
                      }
                    >
                      <div className="relative">
                        {active && (
                          <svg
                            className={cn(
                              "absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] overflow-visible",
                              WATERCOLOR_CLASSES[i % WATERCOLOR_CLASSES.length],
                            )}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M20,10 L40,5 L60,6 L78,10 L91,24 L95,45 L93,65 L85,82 L66,93 L45,95 L24,89 L10,74 L5,52 L8,30Z"
                              fill="#e8cfc5"
                            />
                          </svg>
                        )}
                        <Icon
                          size={24}
                          className={cn(
                            "relative sketch-subtle",
                            !active &&
                              "group-hover/item:sketch-subtle-animated",
                          )}
                        />
                      </div>
                      <span className="text-base uppercase tracking-wide">
                        {route.label}
                      </span>
                    </DialogClose>
                  </li>
                );
              })}
              <li key="contact">
                <DialogClose
                  nativeButton={false}
                  render={
                    <a
                      href="mailto:hello@dcmovieclub.org"
                      className="group/item flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:text-rust"
                    />
                  }
                >
                  <Mail
                    size={24}
                    className="sketch-subtle group-hover/item:sketch-subtle-animated"
                  />
                  <span className="flex-1 text-base uppercase tracking-wide">
                    Contact
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="text-muted-foreground group-hover/item:text-rust"
                  />
                </DialogClose>
              </li>
            </ul>
            <hr className="sketch border-t-2 border-charcoal/20 my-2" />
            <div className="flex items-center justify-center gap-4 py-2">
              {Object.values(socials).map((link) => (
                <a
                  key={link.key}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/item text-muted-foreground transition-colors hover:text-rust"
                >
                  <link.icon
                    size={24}
                    className="sketch-subtle group-hover/item:sketch-subtle-animated"
                  />
                </a>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Link
          href={routes.home.href}
          className={cn(
            "group/logo absolute mt-0.5 left-1/2 -translate-x-1/2 transition-transform hover:scale-105",
            LOGO_SIZE,
          )}
        >
          <Image
            src="/images/dcmc-logo.png"
            alt="DC Movie Club"
            width={NAV_LOGO_SIZE}
            height={NAV_LOGO_SIZE}
            priority
            className={cn(LOGO_SIZE, "group-hover/logo:boil")}
          />
        </Link>
      </div>
    </nav>
  );
}

// The pill's hard shadow with lighter strokes hatched inside it, masked short
// of the shadow's edge and the pill's. The shadow and hatching are separate
// layers, since the ink filter only suits one color on a clear ground, but
// they share an origin, so they wobble in lockstep. Sized from the pill.
function PillShadow() {
  const ref = useRef<SVGSVGElement>(null);
  const id = useId();
  const [size, setSize] = useState<{ width: number; height: number } | null>(
    null,
  );

  useLayoutEffect(() => {
    const pill = ref.current?.parentElement;
    if (!pill) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setSize((prev) =>
        prev?.width === width && prev.height === height
          ? prev
          : { width, height },
      );
    });
    observer.observe(pill);
    return () => observer.disconnect();
  }, []);

  const layer = "absolute inset-0 hidden overflow-visible xs:block";

  return (
    <>
      <svg
        ref={ref}
        aria-hidden
        width={size?.width}
        height={size?.height}
        className={cn(layer, "ink")}
      >
        {size && (
          <rect
            {...pillRect(size, SHADOW_X, SHADOW_Y, 0)}
            className="fill-charcoal"
          />
        )}
      </svg>
      <svg
        aria-hidden
        width={size?.width}
        height={size?.height}
        className={cn(layer, "ink-fine")}
      >
        {size && (
          <>
            <defs>
              <pattern
                id={`${id}-hatch`}
                patternUnits="userSpaceOnUse"
                width={HATCH_GAP}
                height={HATCH_GAP}
                patternTransform="rotate(-45)"
              >
                <rect
                  width={HATCH_WIDTH}
                  height={HATCH_GAP}
                  className="fill-[color-mix(in_srgb,var(--color-charcoal),white_10%)]"
                />
              </pattern>
              <mask
                id={`${id}-mask`}
                maskUnits="userSpaceOnUse"
                x={-20}
                y={-20}
                width={size.width + 40}
                height={size.height + 40}
              >
                <rect
                  {...pillRect(size, SHADOW_X, SHADOW_Y, -HATCH_INSET)}
                  fill="white"
                />
                <rect {...pillRect(size, 0, 0, HATCH_CLEARANCE)} fill="black" />
              </mask>
            </defs>
            <rect
              {...pillRect(size, SHADOW_X, SHADOW_Y, 0)}
              fill={`url(#${id}-hatch)`}
              mask={`url(#${id}-mask)`}
            />
          </>
        )}
      </svg>
    </>
  );
}

// The pill at an offset, grown (or shrunk, for a negative `grow`) on every side
function pillRect(
  { width, height }: { width: number; height: number },
  x: number,
  y: number,
  grow: number,
) {
  return {
    x: x - grow,
    y: y - grow,
    width: width + 2 * grow,
    height: height + 2 * grow,
    rx: height / 2 + grow,
  };
}

const WATERCOLOR_CLASSES = [
  "watercolor-0",
  "watercolor-1",
  "watercolor-2",
  "watercolor-3",
] as const;

function NavLink({
  route,
  active,
}: {
  route: (typeof routes)[keyof typeof routes];
  active: boolean;
}) {
  const Icon = route.icon;
  return (
    <Link
      href={route.href}
      className={cn(
        "group/item relative flex flex-col items-center gap-0.5 transition-all focus-visible:outline-hidden",
        ITEM_PADDING,
        active
          ? "text-logo-red"
          : "text-foreground hover:scale-110 hover:text-rust focus-visible:text-rust",
      )}
    >
      <FocusRing />
      <Icon
        className={cn(
          ICON_SIZE,
          "ink-subtle",
          !active && "group-hover/item:boil",
        )}
      />
      <span
        className={cn(
          LABEL_SIZE,
          // Padding is always applied (and cancelled by negative margins) so
          // only color and rotation change when the tag appears.
          "-mx-1 -my-px rounded-[3px] px-1 py-px uppercase tracking-wide transition-[background-color,color,rotate] duration-300 ease-out",
          active
            ? "-rotate-1 bg-logo-red text-cream sketch-subtle"
            : "group-hover/item:boil-sm",
        )}
      >
        {route.labelShort}
      </span>
    </Link>
  );
}

// A hand-drawn ring around a nav item, in place of the browser's focus box
function FocusRing() {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute -inset-1 rounded-[50%] border-2 border-rust opacity-0 ink-subtle group-focus-visible/item:opacity-100"
    />
  );
}

const NavButton = forwardRef<
  HTMLButtonElement,
  {
    icon: React.ComponentType<{ size?: number; className?: string }>;
    label: string;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function NavButton({ icon: Icon, label, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "group/item relative flex cursor-pointer flex-col items-center gap-0.5 text-foreground transition-all hover:scale-110 hover:text-rust focus-visible:text-rust focus-visible:outline-hidden",
        ITEM_PADDING,
        className,
      )}
      {...props}
    >
      <FocusRing />
      <Icon
        className={cn(
          ICON_SIZE,
          "ink-subtle group-hover/item:boil",
        )}
      />
      <span
        className={cn(
          LABEL_SIZE,
          "uppercase tracking-wide group-hover/item:boil-sm",
        )}
      >
        {label}
      </span>
    </button>
  );
});
