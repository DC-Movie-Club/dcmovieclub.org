import type { Change } from "diff";
import { cn } from "@/lib/utils";

export function DiffView({ diff }: { diff: Change[] }) {
  return (
    <pre className="whitespace-pre-wrap break-words text-xs border rounded bg-muted/50 p-3 max-h-72 overflow-auto">
      {diff.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "bg-green-500/20",
            part.removed && "bg-red-500/20 line-through"
          )}
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}
