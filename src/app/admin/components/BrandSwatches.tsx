"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { Plus, X } from "lucide-react";
import { isHexColor } from "@/config/pages";
import { addBrandSwatch, removeBrandSwatch } from "@/app/admin/actions/brand";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { normalizeHex } from "@/lib/color";
import { cn } from "@/lib/utils";
import type { BrandSwatch } from "@/lib/brand";

type SwatchesState = {
  swatches: BrandSwatch[];
  setSwatches: (swatches: BrandSwatch[]) => void;
};

const BrandSwatchesContext = createContext<SwatchesState | null>(null);

// Shared by every color field on the page, so a swatch saved from one shows
// up in the others
export function BrandSwatchesProvider({
  initialSwatches,
  children,
}: {
  initialSwatches: BrandSwatch[];
  children: React.ReactNode;
}) {
  const [swatches, setSwatches] = useState(initialSwatches);
  return (
    <BrandSwatchesContext value={{ swatches, setSwatches }}>
      {children}
    </BrandSwatchesContext>
  );
}

export function BrandSwatches({
  value,
  onPick,
}: {
  value: string;
  onPick: (hex: string) => void;
}) {
  const context = useContext(BrandSwatchesContext);
  const [editing, setEditing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  if (!context) return null;
  const { swatches, setSwatches } = context;
  const color = isHexColor(value) ? value : "";
  const selected = normalizeHex(color);

  const run = (action: () => Promise<BrandSwatch[]>, failure: string) => {
    setError("");
    startTransition(async () => {
      try {
        setSwatches(await action());
        setAdding(false);
        setLabel("");
      } catch {
        setError(failure);
      }
    });
  };

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-6 items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">
          Brand colors
        </span>
        {swatches.length > 0 && (
          <Button
            variant="ghost"
            size="xs"
            onClick={() => {
              setEditing((e) => !e);
              setAdding(false);
            }}
          >
            {editing ? "Done" : "Edit"}
          </Button>
        )}
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {swatches.map((swatch) => (
          <button
            key={swatch.key}
            type="button"
            title={`${swatch.label} ${swatch.hex}`}
            aria-label={
              editing ? `Remove ${swatch.label}` : `Use ${swatch.label}`
            }
            disabled={pending}
            className={cn(
              "relative aspect-square cursor-pointer rounded-md border border-foreground/15 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default",
              !editing &&
                selected === normalizeHex(swatch.hex) &&
                "ring-2 ring-foreground ring-offset-1 ring-offset-popover",
            )}
            style={{ backgroundColor: swatch.hex }}
            onClick={() =>
              editing
                ? run(
                    () => removeBrandSwatch(swatch.key),
                    "Couldn't remove the swatch",
                  )
                : onPick(swatch.hex)
            }
          >
            {editing && (
              <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-foreground text-background">
                <X className="size-3" />
              </span>
            )}
          </button>
        ))}
        {!editing && (
          <button
            type="button"
            title="Save this color as a brand color"
            aria-label="Save this color as a brand color"
            disabled={!color || pending}
            className="flex aspect-square cursor-pointer items-center justify-center rounded-md border border-dashed border-foreground/30 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-default disabled:opacity-40"
            onClick={() => setAdding(true)}
          >
            <Plus className="size-3.5" />
          </button>
        )}
      </div>
      {adding && color && (
        <form
          className="flex items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            run(
              () => addBrandSwatch({ label, hex: color }),
              "Couldn't save the swatch",
            );
          }}
        >
          <span
            className="size-7 shrink-0 rounded-md border border-foreground/15"
            style={{ backgroundColor: color }}
          />
          <Input
            autoFocus
            value={label}
            placeholder="Name"
            aria-label="Brand color name"
            className="h-7"
            onChange={(e) => setLabel(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={pending}>
            Save
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Cancel"
            onClick={() => setAdding(false)}
          >
            <X />
          </Button>
        </form>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
