"use client";

import { forwardRef, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Ellipsis, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";
import { Discord } from "@/components/icons/Discord";
import { Instagram } from "@/components/icons/Instagram";
import { Letterboxd } from "@/components/icons/Letterboxd";
import { Youtube } from "@/components/icons/Youtube";
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
            "absolute inset-0 border-t-2 border-charcoal/20 bg-surface sketch xs:border-2 xs:rounded-full",
            hovered && "sketch-animated",
          )}
        />
        <NavLink
          route={routes.blog}
          active={pathname === routes.blog.href}
          watercolorIndex={0}
          {...(pathname === routes.blog.href ? {} : itemHoverProps)}
        />

        <NavLink
          route={routes.events}
          active={pathname === routes.events.href}
          watercolorIndex={1}
          {...(pathname === routes.events.href ? {} : itemHoverProps)}
        />

        <div className={LOGO_SPACER} />

        <NavLink
          route={routes.partnerships}
          active={pathname === routes.partnerships.href}
          watercolorIndex={2}
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
                            className={cn("absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)] overflow-visible", WATERCOLOR_CLASSES[i % WATERCOLOR_CLASSES.length])}
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                          >
                            <path
                              d="M15,12 L30,5 L45,14 L55,4 L70,8 L85,12 L95,25 L92,45 L96,60 L88,75 L78,88 L60,92 L40,95 L25,88 L12,75 L5,58 L8,35 L6,20Z"
                              fill="#e8cfc5"
                            />
                          </svg>
                        )}
                        <Icon
                          size={24}
                          className={cn(
                            "relative sketch-subtle",
                            !active && "group-hover/item:sketch-subtle-animated",
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
              {[
                { label: "Contact", href: "https://mail.google.com/mail/u/0/?fs=1&tf=cm&source=mailto&to=abbie@dcmovieclub.org", icon: Mail },
                { label: "Instagram", href: "https://www.instagram.com/dcmovieclub/", icon: Instagram },
                { label: "Letterboxd", href: "https://letterboxd.com/DCMovieClub/", icon: Letterboxd },
                { label: "Discord", href: "https://discord.com/invite/hWRfjVpPws", icon: Discord },
                { label: "YouTube", href: "https://www.youtube.com/@DCMovieClub", icon: Youtube },
              ].map((link) => (
                <li key={link.label}>
                  <DialogClose
                    nativeButton={false}
                    render={
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/item flex items-center gap-3 rounded-lg px-4 py-3 text-foreground transition-colors hover:text-rust"
                      />
                    }
                  >
                    <link.icon size={24} className="sketch-subtle group-hover/item:sketch-subtle-animated" />
                    <span className="flex-1 text-base uppercase tracking-wide">
                      {link.label}
                    </span>
                    <ArrowUpRight
                      size={12}
                      className="text-muted-foreground group-hover/item:text-rust"
                    />
                  </DialogClose>
                </li>
              ))}
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
              logoHovered && "sketch-subtle-animated",
            )}
          />
        </Link>
      </div>
    </nav>
  );
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
  watercolorIndex = 0,
  onMouseEnter,
  onMouseLeave,
}: {
  route: (typeof routes)[keyof typeof routes];
  active: boolean;
  watercolorIndex?: number;
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
      <div className="relative">
        {active && (
          <svg
            className={cn("absolute -inset-2 h-[calc(100%+16px)] w-[calc(100%+16px)] overflow-visible", WATERCOLOR_CLASSES[watercolorIndex])}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M15,12 L30,5 L45,14 L55,4 L70,8 L85,12 L95,25 L92,45 L96,60 L88,75 L78,88 L60,92 L40,95 L25,88 L12,75 L5,58 L8,35 L6,20Z"
              className="fill-rust-wash"
            />
          </svg>
        )}
        <Icon
          className={cn(
            ICON_SIZE,
            "relative sketch-subtle",
            !active && "group-hover/item:sketch-subtle-animated",
          )}
        />
      </div>
      <span className={cn(LABEL_SIZE, "relative uppercase tracking-wide")}>
        {route.labelShort}
      </span>
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
      <Icon className={cn(ICON_SIZE, "sketch-subtle group-hover/item:sketch-subtle-animated")} />
      <span className={cn(LABEL_SIZE, "uppercase tracking-wide")}>{label}</span>
    </button>
  );
});
