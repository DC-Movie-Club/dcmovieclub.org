"use client";

import {
  forwardRef,
  useId,
  type CSSProperties,
  useLayoutEffect,
  useRef,
  useState,
  ViewTransition,
} from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoOutline } from "@/components/LogoOutline";
import { routes, socials } from "@/config/navigation";
import { colorVars } from "@/config/pages";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SmartLink } from "@/components/system/SmartLink";

const menuRoutes = [routes.partnerships];
const NAV_LOGO_SIZE = 112;

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

// `accents` holds each page's accent color by route; an item takes its page's
// for hover and the active state, and an item without one keeps the defaults
// in globals.css. `backgrounds` holds each page's background by route, which
// the fade under the nav and the corner patch take.
export function BottomNav({
  accents,
  backgrounds,
}: {
  accents: Record<string, string>;
  backgrounds: Record<string, string>;
}) {
  const pathname = usePathname();
  const onHome = pathname === routes.home.href;
  const activeMenuRoute = menuRoutes.find((route) => route.href === pathname);
  const pageBackground = colorVars({ background: backgrounds[pathname] });

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-0 z-40 h-21 bg-linear-to-b from-transparent via-page-bg/55 via-60% to-page-bg/85 mask-t-from-0% xs:h-28"
        style={pageBackground}
      />
      {/* Safari paints a small black square at the page's top-left corner for
          filtered elements outside the area it's repainting (WebKit bug
          314999, fixed upstream in June 2026). This covers that corner in the
          page's background, fading in with the page. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-40 size-5 animate-page-fade-in bg-page-bg"
        style={pageBackground}
      />
      {/* Navigating crossfades the bar into its new state, over the page's
          own crossfade (see the root layout) */}
      <ViewTransition default="none" update="auto">
        <nav className="fixed bottom-0 left-0 right-0 z-50 animate-nav-spring-in select-none motion-reduce:animate-none xs:bottom-6 xs:left-1/2 xs:right-auto xs:-translate-x-1/2">
          {/* Grows a touch on hover or keyboard focus, with the same spring as
              its entrance */}
          <div className="relative flex items-center justify-center gap-4 px-4 py-2 transition-[scale] duration-300 ease-[cubic-bezier(0.3,1.35,0.5,1)] xs:px-6 xs:py-3 xs:hover:scale-[1.03] xs:has-[:focus-visible]:scale-[1.03]">
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
            <BarLink route={routes.events} pathname={pathname} accents={accents} />
            <BarLink route={routes.blog} pathname={pathname} accents={accents} />

            <div className={LOGO_SPACER} />

            <BarLink route={routes.about} pathname={pathname} accents={accents} />

            <Dialog>
              <DialogTrigger
                render={
                  <NavButton
                    icon={Ellipsis}
                    label="More"
                    active={Boolean(activeMenuRoute)}
                    style={accentVars(
                      activeMenuRoute && accents[activeMenuRoute.href],
                      accents[menuRoutes[0].href],
                    )}
                  />
                }
              />
              <DialogContent showCloseButton={false}>
                <DialogTitle className="sr-only">More</DialogTitle>
                <ul className="flex flex-col gap-1">
                  {menuRoutes.map((route) => {
                    const active = pathname === route.href;
                    return (
                      <li key={route.key}>
                        <DialogClose
                          nativeButton={false}
                          render={
                            <Link
                              href={route.href}
                              className={navItemClass("menu", active)}
                              style={accentVars(accents[route.href])}
                            />
                          }
                        >
                          <NavItemContent
                            layout="menu"
                            active={active}
                            icon={route.icon}
                            label={route.label}
                          />
                        </DialogClose>
                      </li>
                    );
                  })}
                  <li key="contact">
                    <DialogClose
                      nativeButton={false}
                      render={
                        <a
                          href={routes.contact.href}
                          className={navItemClass("menu", false)}
                        />
                      }
                    >
                      <NavItemContent
                        layout="menu"
                        active={false}
                        icon={routes.contact.icon}
                        label={routes.contact.label}
                      />
                      <ArrowUpRight
                        size={12}
                        className="ml-auto text-muted-foreground group-hover/item:text-nav-hover group-focus-visible/item:text-nav-hover"
                      />
                    </DialogClose>
                  </li>
                </ul>
                <hr className="sketch border-t-2 border-charcoal/20 my-2" />
                <div className="flex items-center justify-center gap-4 py-2">
                  {Object.values(socials).map((link) => (
                    <SmartLink
                      key={link.key}
                      href={link.href}
                      className="group/item text-muted-foreground transition-colors hover:text-rust"
                    >
                      <link.icon
                        size={24}
                        className="sketch-subtle group-hover/item:sketch-subtle-animated"
                      />
                    </SmartLink>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Link
              href={routes.home.href}
              className={cn(
                "group/logo absolute mt-0.5 left-1/2 -translate-x-1/2 transition-[scale,translate] duration-300 ease-[cubic-bezier(0.3,1.35,0.5,1)] focus-visible:outline-hidden",
                // Home is the logo's page, so there it's full size and in color, and
                // stays a link without hover feedback, like the other items on
                // their own pages. Elsewhere it's drawn in line, smaller and lower
                // in the bar; on hover it boils and turns logo red, grows by about
                // as much as the other items, and rises to where it sits on home.
                !onHome &&
                  "translate-y-1 scale-90 hover:translate-y-0 hover:scale-[0.99] focus-visible:translate-y-0 focus-visible:scale-[0.99]",
                LOGO_SIZE,
              )}
            >
              <Image
                src="/images/dcmc-logo.png"
                alt="DC Movie Club"
                width={NAV_LOGO_SIZE}
                height={NAV_LOGO_SIZE}
                priority
                className={cn(
                  LOGO_SIZE,
                  "transition-opacity duration-300 ease-out",
                  !onHome && "opacity-0",
                )}
              />
              {/* Mounted on every page, so arriving home crossfades it into the
                  color logo */}
              <LogoOutline
                className={cn(
                  "pointer-events-none absolute inset-0 transition-[color,opacity] duration-300 ease-out",
                  onHome
                    ? "opacity-0"
                    : "group-hover/logo:text-logo-red group-focus-visible/logo:text-logo-red",
                )}
                layerClassName={cn(
                  !onHome && "group-hover/logo:boil group-focus-visible/logo:boil",
                )}
              />
            </Link>
          </div>
        </nav>
      </ViewTransition>
    </>
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

// The nav's items, as a column in the bar or a row in the More menu. Both
// share the active style (a red icon over a red label tag) and the hover
// style, which keyboard focus also takes.
const LAYOUTS = {
  bar: {
    key: "bar",
    item: "flex-col gap-0.5 px-2 py-1 xs:px-3 xs:py-1.5",
    // Scaling a whole menu row would shift it, so only the bar grows. On its
    // own page an item sits at its hover size, like the logo on home.
    hover: "hover:scale-110 focus-visible:scale-110",
    active: "scale-110",
    icon: "size-7 xs:size-8",
    // Padding is always applied (and cancelled by negative margins) so only
    // color and rotation change when the tag appears.
    label: "-mx-1 -my-px px-1 py-px text-[9px] xs:text-[11px]",
  },
  menu: {
    key: "menu",
    item: "gap-3 rounded-lg px-4 py-3",
    hover: "",
    active: "",
    icon: "size-6",
    label: "-mx-1.5 -my-0.5 px-1.5 py-0.5 text-base",
  },
} as const;

type NavLayout = keyof typeof LAYOUTS;

// An item on its own page doesn't respond to hover, unless `hoverable` says
// it still leads somewhere new, like the More menu
function navItemClass(
  layout: NavLayout,
  active: boolean,
  hoverable = !active,
) {
  return cn(
    "group/item relative flex items-center transition-all focus-visible:outline-hidden",
    LAYOUTS[layout].item,
    active ? "text-nav-active" : "text-foreground",
    active && LAYOUTS[layout].active,
    hoverable &&
      cn(
        "hover:text-nav-hover focus-visible:text-nav-hover",
        LAYOUTS[layout].hover,
      ),
  );
}

function NavItemContent({
  layout,
  active,
  hoverable = !active,
  icon: Icon,
  label,
}: {
  layout: NavLayout;
  active: boolean;
  hoverable?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <>
      {/* The filter goes on a box around the icon: Safari fits an SVG's
          filter region to its shapes rather than its box, which cropped
          small shapes like the More dots flat */}
      <span
        className={cn(
          LAYOUTS[layout].icon,
          "ink-subtle",
          hoverable && "group-hover/item:boil group-focus-visible/item:boil",
        )}
      >
        <Icon className="size-full" />
      </span>
      <span
        className={cn(
          LAYOUTS[layout].label,
          "rounded-[3px] uppercase tracking-wide transition-[background-color,color,rotate] duration-300 ease-out",
          active && "-rotate-1 bg-nav-active text-cream sketch-subtle",
          hoverable &&
            "group-hover/item:boil-sm group-focus-visible/item:boil-sm",
        )}
      >
        {label}
      </span>
    </>
  );
}

// The variables nav items color with (see globals.css): a page's accent, and
// for an item that hovers in another color, that one
function accentVars(
  accent: string | undefined,
  hoverAccent?: string,
): CSSProperties {
  return Object.fromEntries(
    [
      ["--nav-accent", accent],
      ["--nav-hover-accent", hoverAccent],
    ].filter(([, color]) => color),
  );
}

function BarLink({
  route,
  pathname,
  accents,
}: {
  route: (typeof routes)[keyof typeof routes];
  pathname: string;
  accents: Record<string, string>;
}) {
  const active = pathname === route.href;
  return (
    <Link
      href={route.href}
      className={navItemClass("bar", active)}
      style={accentVars(accents[route.href])}
    >
      <NavItemContent
        layout="bar"
        active={active}
        icon={route.icon}
        label={route.labelShort}
      />
    </Link>
  );
}

// The More menu's trigger. It lights up in the color of whichever page in its
// menu is current, and since it opens the menu either way, it still responds
// to hover then, in the color of the menu's first page.
const NavButton = forwardRef<
  HTMLButtonElement,
  {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
  } & React.ButtonHTMLAttributes<HTMLButtonElement>
>(function NavButton({ icon, label, active, className, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        navItemClass("bar", active, true),
        "cursor-pointer",
        className,
      )}
      {...props}
    >
      <NavItemContent
        layout="bar"
        active={active}
        hoverable
        icon={icon}
        label={label}
      />
    </button>
  );
});
