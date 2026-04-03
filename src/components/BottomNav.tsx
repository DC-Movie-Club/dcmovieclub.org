"use client";

import { forwardRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Ellipsis } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const menuRoutes = [routes.about, routes.contact];
const NAV_LOGO_SIZE = 112;

const ICON_SIZE = "size-6 xs:size-6";
const LABEL_SIZE = "text-[8px] xs:text-[10px]";
const ITEM_PADDING = "px-2 py-1 xs:px-3 xs:py-1.5";
const LOGO_SIZE = "size-24 -top-8 xs:size-28 xs:-top-8";
const LOGO_SPACER = "w-[88px] xs:w-[120px]";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 xs:bottom-6 xs:left-1/2 xs:right-auto xs:-translate-x-1/2">
      <div className="relative flex items-center justify-center gap-4 bg-charcoal px-4 py-2 xs:rounded-full xs:px-6 xs:py-3">
        <NavLink
          route={routes.events}
          active={pathname === routes.events.href}
        />

        <NavLink route={routes.blog} active={pathname === routes.blog.href} />

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
              {menuRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <li key={route.key}>
                    <DialogClose
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
            </ul>
          </DialogContent>
        </Dialog>

        <Link
          href={routes.home.href}
          className={cn(
            "absolute left-1/2 -translate-x-1/2 transition-transform hover:scale-105",
            LOGO_SIZE,
          )}
        >
          <Image
            src="/images/dcmc-logo.png"
            alt="DC Movie Club"
            width={NAV_LOGO_SIZE}
            height={NAV_LOGO_SIZE}
            className={LOGO_SIZE}
          />
        </Link>
      </div>
    </nav>
  );
}

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
        "relative flex flex-col items-center gap-0.5 transition-all hover:scale-110",
        ITEM_PADDING,
        active ? "text-rust" : "text-cream hover:text-cream",
      )}
    >
      <Icon className={ICON_SIZE} />
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
>(function NavButton({ icon: Icon, label, ...props }, ref) {
  return (
    <button
      ref={ref}
      className={cn(
        "relative flex flex-col items-center gap-0.5 text-cream transition-all hover:scale-110 hover:text-cream",
        ITEM_PADDING,
      )}
      {...props}
    >
      <Icon className={ICON_SIZE} />
      <span className={cn(LABEL_SIZE, "uppercase tracking-wide")}>{label}</span>
    </button>
  );
});
