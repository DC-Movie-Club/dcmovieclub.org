import { cn } from "@/lib/utils";

const COLUMNS = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

// Tiles in `columns` from small screens up, one to a row on phones. Its
// children are the list items. Tiles with a badge over their top edge
// (`badged`) get the room for it between rows.
export function TileGrid({
  columns,
  badged,
  children,
}: {
  columns: keyof typeof COLUMNS;
  badged?: boolean;
  children: React.ReactNode;
}) {
  return (
    <ul className={cn("grid", badged ? "gap-x-4 gap-y-8" : "gap-4", COLUMNS[columns])}>
      {children}
    </ul>
  );
}
