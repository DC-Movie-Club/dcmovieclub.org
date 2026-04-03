"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { routes } from "@/config/navigation";

const menuRoutes = [routes.about, routes.contact, routes.instagram];
const NAV_LOGO_SIZE = 112;
const NAV_LOGO_SPACER = NAV_LOGO_SIZE + 8;

export function BottomNav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      {/* Menu drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div
            className="absolute bottom-20 left-1/2 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-border bg-surface p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="flex flex-col gap-1">
              {menuRoutes.map((route) => {
                const Icon = route.icon;
                return (
                  <li key={route.key}>
                    <Link
                      href={route.href}
                      onClick={() => setMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 transition-colors hover:bg-muted",
                        pathname === route.href
                          ? "text-primary"
                          : "text-foreground",
                      )}
                    >
                      <Icon size={30} />
                      <span className="text-sm uppercase tracking-wide">
                        {route.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}

      {/* Bottom nav bar */}
      <nav className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
        <div className="relative flex items-center gap-4 rounded-full bg-charcoal px-6 py-3">
          <NavButton
            icon={menuOpen ? X : Menu}
            label="Menu"
            active={false}
            onClick={() => setMenuOpen(!menuOpen)}
          />

          <NavLink
            route={routes.events}
            active={pathname === routes.events.href}
          />

          {/* Spacer for the absolutely positioned logo */}
          <div style={{ width: NAV_LOGO_SPACER }} />

          <NavLink route={routes.blog} active={pathname === routes.blog.href} />

          <NavLink
            route={routes.partnerships}
            active={pathname === routes.partnerships.href}
          />

          <Link
            href={routes.home.href}
            className="absolute left-1/2 -translate-x-1/2 -top-8 transition-transform hover:scale-105"
          >
            <Image
              src="/images/dcmc-logo.png"
              alt="DC Movie Club"
              width={NAV_LOGO_SIZE}
              height={NAV_LOGO_SIZE}
            />
          </Link>
        </div>
      </nav>
    </>
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
        "relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all hover:scale-110",
        active ? "text-rust" : "text-cream hover:text-cream",
      )}
    >
      <Icon size={30} />
      <span className="text-[10px] uppercase tracking-wide">
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

function NavButton({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-0.5 px-3 py-1.5 transition-all hover:scale-110",
        active ? "text-rust" : "text-cream hover:text-cream",
      )}
    >
      <Icon size={30} />
      <span className="text-[10px] uppercase tracking-wide">{label}</span>
    </button>
  );
}
