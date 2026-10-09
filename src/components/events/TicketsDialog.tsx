"use client";

import { useRef, useState } from "react";
import { Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import { Dialog, DialogClose, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { colorRoles } from "@/config/pages";
import { Pill } from "@/components/system/Pill";
import { SketchDialogContent } from "@/components/system/SketchDialogContent";
import { textStyles } from "@/components/textStyles";
import type { EventTicket } from "@/types/event";

// The dialog portals out of the page, so it copies the colors the page sets
// around the trigger onto itself, for its title and ticket pills
function pageColorVars(element: HTMLElement | null) {
  if (!element) return undefined;
  const style = getComputedStyle(element);
  return Object.fromEntries(
    Object.values(colorRoles).map(({ cssVar }) => [cssVar, style.getPropertyValue(cssVar)]),
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
  const [colors, setColors] = useState<React.CSSProperties>();

  return (
    <Dialog
      onOpenChange={(open) => {
        if (open) setColors(pageColorVars(triggerRef.current));
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
      <SketchDialogContent style={colors}>
        <DialogTitle className={cn("px-4 pt-2 text-center text-balance", textStyles.dialogTitle)}>
          {title}
        </DialogTitle>
        <ul className="mt-5 flex flex-col items-center gap-4 pb-2">
          {tickets.map((ticket) => (
            <li key={ticket.url}>
              <DialogClose
                nativeButton={false}
                render={
                  <Pill
                    variant="accent"
                    size="lg"
                    href={ticket.url}
                    icon={Ticket}
                  >
                    {ticket.label}
                  </Pill>
                }
              />
            </li>
          ))}
        </ul>
      </SketchDialogContent>
    </Dialog>
  );
}
