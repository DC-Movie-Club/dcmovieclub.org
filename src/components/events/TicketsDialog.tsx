"use client";

import { useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CornerCloseButton } from "@/components/CornerCloseButton";
import { CardEdgeFace } from "@/components/section-cards";
import type { EventTicket } from "@/types/event";
import { SmartLink } from "@/components/system/SmartLink";

const ACCENT_VARS = [
  "--page-accent",
  "--page-accent-edge",
  "--page-accent-text",
];

// The dialog portals out of the page, so it copies the accent colors the
// page sets around the trigger onto its own ticket pills.
function accentVars(element: HTMLElement | null) {
  if (!element) return undefined;
  const style = getComputedStyle(element);
  return Object.fromEntries(
    ACCENT_VARS.map((name) => [name, style.getPropertyValue(name)]),
  ) as React.CSSProperties;
}

// A picker for an event's several ticket links, opened by `children` wrapped
// in a <div> with `className`. Not a <button>, since a clickable card drops
// its card-hover styles while pointing at one.
export function TicketsDialog({
  title,
  tickets,
  className,
  tabIndex,
  "aria-hidden": ariaHidden,
  children,
}: {
  title: string;
  tickets: EventTicket[];
  className?: string;
  tabIndex?: number;
  "aria-hidden"?: boolean;
  children?: React.ReactNode;
}) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const [accents, setAccents] = useState<React.CSSProperties>();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setAccents(accentVars(triggerRef.current));
      }}
    >
      <DialogTrigger
        nativeButton={false}
        // Base UI's default for a trigger that isn't a <button>; passing
        // undefined would drop it and take the trigger out of the tab order
        tabIndex={tabIndex ?? 0}
        aria-hidden={ariaHidden}
        render={
          <div ref={triggerRef} className={cn("cursor-pointer", className)} />
        }
      >
        {children}
      </DialogTrigger>
      <DialogContent showCloseButton={false} style={accents}>
        <DialogTitle className="px-4 pt-2 text-center text-lg uppercase leading-tight tracking-wide text-balance text-foreground">
          {title}
        </DialogTitle>
        <ul className="mt-5 flex flex-col items-center gap-4 pb-2">
          {tickets.map((ticket) => (
            <li key={ticket.url}>
              <DialogClose
                nativeButton={false}
                render={
                  <SmartLink
                    href={ticket.url}
                    className="group/edge relative block rounded-full transition-transform hover:scale-105 focus-ring focus-ring-rust"
                  />
                }
              >
                <CardEdgeFace>
                  <Ticket size={18} className="shrink-0" />
                  {ticket.label}
                </CardEdgeFace>
              </DialogClose>
            </li>
          ))}
        </ul>
        <CornerCloseButton />
      </DialogContent>
    </Dialog>
  );
}
