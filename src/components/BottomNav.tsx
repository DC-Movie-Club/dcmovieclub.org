"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";
import { Letterboxd } from "@/components/icons/Letterboxd";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const menuRoutes = [routes.about, routes.contact];
const NAV_LOGO_SIZE = 112;

const ICON_SIZE = "size-7 xs:size-8";
const LABEL_SIZE = "text-[9px] xs:text-[11px]";
const ITEM_PADDING = "px-2 py-1 xs:px-3 xs:py-1.5";
const LOGO_SIZE = "size-24 -top-8 xs:size-28 xs:-top-8";
const LOGO_SPACER = "w-[88px] xs:w-[120px]";

export function BottomNav() {
  const pathname = usePathname();
  const [hovered, setHovered] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  useEffect(() => {
    setHovered(false);
    setLogoHovered(false);
  }, [pathname]);

  const itemHoverProps = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  const logoHoverProps = {
    onMouseEnter: () => { setHovered(true); setLogoHovered(true); },
    onMouseLeave: () => { setHovered(false); setLogoHovered(false); },
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xs:bottom-6 xs:left-1/2 xs:right-auto xs:-translate-x-1/2">
      <div className="relative flex items-center justify-center gap-4 px-4 py-2 xs:px-6 xs:py-3">
        <div
          className={cn(
            "absolute inset-0 border-t-2 border-charcoal-detail bg-surface hand-drawn-subtle xs:border-2 xs:rounded-full",
            hovered && "hand-drawn-animated",
          )}
        />
        <NavLink
          route={routes.events}
          active={pathname === routes.events.href}
          {...(pathname === routes.events.href ? {} : itemHoverProps)}
        />

        <NavLink
          route={routes.blog}
          active={pathname === routes.blog.href}
          {...(pathname === routes.blog.href ? {} : itemHoverProps)}
        />

        <div className={LOGO_SPACER} />

        <NavLink
          route={routes.partnerships}
          active={pathname === routes.partnerships.href}
          {...(pathname === routes.partnerships.href ? {} : itemHoverProps)}
        />

        <Dialog>
          <DialogTrigger
            render={
              <NavButton
                icon={Ellipsis}
                label="More"
                {...itemHoverProps}
              />
            }
          />
          <DialogContent showCloseButton={false}>
            <DialogTitle className="sr-only">More</DialogTitle>
            <ul className="flex flex-col gap-1">
              {menuRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <li key={route.key}>
                    <DialogClose
                      nativeButton={false}
                      render={
                        <Link
                          href={route.href}
                          className={cn(
                            "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted",
                            pathname === route.href
                              ? "text-primary"
                              : "text-foreground",
                          )}
                        />
                      }
                    >
                      <Icon size={24} />
                      <span className="text-base uppercase tracking-wide">
                        {route.label}
                      </span>
                    </DialogClose>
                  </li>
                );
              })}
              <li>
                <DialogClose
                  nativeButton={false}
                  render={
                    <a
                      href="https://letterboxd.com/DCMovieClub/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:bg-muted"
                    />
                  }
                >
                  <Letterboxd size={24} />
                  <span className="flex-1 text-base uppercase tracking-wide">
                    Letterboxd
                  </span>
                  <ArrowUpRight
                    size={12}
                    className="text-muted-foreground"
                  />
                </DialogClose>
              </li>
            </ul>
          </DialogContent>
        </Dialog>

        <Link
          href={routes.home.href}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-transform hover:scale-105",
            LOGO_SIZE,
          )}
          {...logoHoverProps}
        >
          <Image
            src="/images/dcmc-logo.png"
            alt="DC Movie Club"
            width={NAV_LOGO_SIZE}
            height={NAV_LOGO_SIZE}
            className={cn(
              LOGO_SIZE,
              logoHovered && "hand-drawn hand-drawn-animated",
            )}
          />
        </Link>
      </div>
    </nav>
  );
}

function NavLink({
  route,
  active,
  onMouseEnter,
  onMouseLeave,
}: {
  route: (typeof routes)[keyof typeof routes];
  active: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}) {
  const Icon = route.icon;
  return (
    <Link
      href={route.href}
      className={cn(
        "group/item relative flex flex-col items-center gap-0.5 transition-all",
        ITEM_PADDING,
        active
          ? "text-rust"
          : "text-foreground hover:scale-110 hover:text-rust",
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Icon
        className={cn(
          ICON_SIZE,
          "hand-drawn-subtle",
          !active && "group-hover/item:hand-drawn group-hover/item:hand-drawn-animated",
        )}
      />
      <span className={cn(LABEL_SIZE, "uppercase tracking-wide")}>
        {route.labelShort}
      </span>
      {active && (
        <svg
          className="absolute -bottom-1 left-1/2 -translate-x-1/2"
          width="32"
          height="6"
          viewBox="0 0 32 6"
          fill="none"
        >
          <path
            d="M2 4C6 2.5 10 1.5 16 2C22 2.5 26 3.5 30 2"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </Link>
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
        "group/item relative flex cursor-pointer flex-col items-center gap-0.5 text-foreground transition-all hover:scale-110 hover:text-rust",
        ITEM_PADDING,
        className,
      )}
      {...props}
    >
      <Icon className={cn(ICON_SIZE, "hand-drawn-subtle group-hover/item:hand-drawn group-hover/item:hand-drawn-animated")} />
      <span className={cn(LABEL_SIZE, "uppercase tracking-wide")}>{label}</span>
    </button>
  );
});
