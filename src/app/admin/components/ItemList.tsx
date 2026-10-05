"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function IconAction({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

// A list admins can add to, reorder and remove from. Each row shows `head`
// beside its controls and `body`, if any, full width under them.
export function ItemList<T extends { key: string }>({
  items,
  noun,
  nameOf,
  onChange,
  onAdd,
  head,
  body,
}: {
  items: T[];
  // What one item is called, like "question"
  noun: string;
  // Names an item in button labels, like "Move “Who can come?” up"
  nameOf: (item: T) => string;
  onChange: (items: T[]) => void;
  onAdd: () => void;
  head: (item: T) => React.ReactNode;
  body?: (item: T) => React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      {items.length > 0 ? (
        <ol className="flex flex-col gap-2">
          {items.map((item, index) => {
            const name = nameOf(item).trim() || `this ${noun}`;
            return (
              <li
                key={item.key}
                className="flex flex-col gap-2 rounded-lg border bg-card p-2"
              >
                <div className="flex items-center gap-2">
                  <div className="min-w-0 flex-1">{head(item)}</div>
                  <div className="flex shrink-0 items-center">
                    <IconAction
                      label={`Move ${name} up`}
                      disabled={index === 0}
                      onClick={() => onChange(moved(items, index, index - 1))}
                    >
                      <ArrowUp />
                    </IconAction>
                    <IconAction
                      label={`Move ${name} down`}
                      disabled={index === items.length - 1}
                      onClick={() => onChange(moved(items, index, index + 1))}
                    >
                      <ArrowDown />
                    </IconAction>
                    <IconAction
                      label={`Remove ${name}`}
                      onClick={() =>
                        onChange(items.filter((i) => i.key !== item.key))
                      }
                    >
                      <Trash2 />
                    </IconAction>
                  </div>
                </div>
                {body?.(item)}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="rounded-lg border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
          {`No ${noun}s yet. This part of the page is hidden until you add one.`}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={onAdd}
      >
        <Plus />
        {`Add ${noun}`}
      </Button>
    </div>
  );
}
