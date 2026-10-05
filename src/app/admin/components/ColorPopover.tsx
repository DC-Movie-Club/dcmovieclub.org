"use client";

import { Check, TriangleAlert } from "lucide-react";
import { partnersOf } from "@/config/contrast";
import { colorRoles, isHexColor, type ColorRoleKey } from "@/config/pages";
import { BrandSwatches } from "@/app/admin/components/BrandSwatches";
import { ColorPicker } from "@/app/admin/components/ColorPicker";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover";
import { contrastRatio, shades } from "@/lib/color";
import { cn } from "@/lib/utils";

function Shades({
  color,
  onPick,
}: {
  color: string;
  onPick: (hex: string) => void;
}) {
  const { darker, lighter } = shades(color);
  const step = (hex: string) => (
    <button
      key={hex}
      type="button"
      title={hex}
      aria-label={`Use ${hex}`}
      className="h-6 flex-1 cursor-pointer rounded-md border border-foreground/15 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      style={{ backgroundColor: hex }}
      onClick={() => onPick(hex)}
    />
  );
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted-foreground">Shades</span>
      <div className="flex items-center gap-1">
        {darker.map(step)}
        <span
          title={`Current color ${color}`}
          className="h-8 flex-1 rounded-md border border-foreground/15 ring-2 ring-foreground ring-offset-1 ring-offset-popover"
          style={{ backgroundColor: color }}
        />
        {lighter.map(step)}
      </div>
    </div>
  );
}

// WCAG says not to round a ratio up to a passing one, so this floors
function ratioText(ratio: number) {
  return `${Math.floor(ratio * 10) / 10}:1`;
}

export function Contrast({
  role,
  color,
  colors,
}: {
  role: ColorRoleKey;
  color: string;
  colors: Record<ColorRoleKey, string>;
}) {
  const partners = partnersOf(role);
  if (partners.length === 0) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs font-medium text-muted-foreground">
        Contrast
      </span>
      {partners.map(([partner, minimum]) => {
        const name = colorRoles[partner].label.toLowerCase();
        const other = colors[partner];
        if (!isHexColor(other)) {
          return (
            <p key={partner} className="text-xs text-muted-foreground">
              Set a {name} color to check contrast with it
            </p>
          );
        }
        const ratio = contrastRatio(color, other);
        const passes = ratio >= minimum;
        const Icon = passes ? Check : TriangleAlert;
        return (
          <p key={partner} className="flex items-start gap-1.5 text-xs">
            <Icon
              className={cn(
                "mt-px size-3.5 shrink-0",
                passes ? "text-muted-foreground" : "text-destructive",
              )}
            />
            <span>
              {ratioText(ratio)} with {name}
              <span className="text-muted-foreground">
                {passes
                  ? " · passes AA"
                  : ` · below AA (${minimum}:1), may be hard to read`}
              </span>
            </span>
          </p>
        );
      })}
    </div>
  );
}

// `value` is "" when the color isn't set, and may be half-typed hex from the
// field's text input. `children` go under the shades, like a page color's
// contrast checks.
export function ColorPopover({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children?: React.ReactNode;
}) {
  const color = isHexColor(value) ? value : "";
  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Pick ${label.toLowerCase()} color`}
        className={cn(
          "size-8 shrink-0 cursor-pointer rounded-md border outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          !color && "border-dashed",
        )}
        style={{ backgroundColor: color || undefined }}
      />
      <PopoverContent
        align="start"
        className="max-h-(--available-height) w-64 gap-3 overflow-y-auto p-3"
      >
        <div className="flex h-6 items-center justify-between gap-2">
          <PopoverTitle>{label}</PopoverTitle>
          {value ? (
            <Button variant="ghost" size="xs" onClick={() => onChange("")}>
              Clear
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">Not set</span>
          )}
        </div>
        <ColorPicker color={color} onChange={onChange} />
        {color && <Shades color={color} onPick={onChange} />}
        {children}
        <BrandSwatches value={color} onPick={onChange} />
      </PopoverContent>
    </Popover>
  );
}
