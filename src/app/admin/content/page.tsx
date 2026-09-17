import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

export default async function ContentPage() {
  const slots = Object.values(copySlots);
  const docs = await Promise.all(slots.map((slot) => getCopy(slot.key)));

  return (
    <ItemGroup className="gap-2">
      {slots.map((slot, i) => {
        const { updatedAt, updatedByName } = docs[i];
        return (
          <Item
            key={slot.key}
            variant="outline"
            render={<Link href={`/admin/content/${slot.key}`} />}
          >
            <ItemContent>
              <ItemTitle>{slot.label}</ItemTitle>
              <ItemDescription>
                {updatedAt
                  ? `Saved ${new Date(updatedAt).toLocaleDateString()}${updatedByName ? ` by ${updatedByName}` : ""}`
                  : "Empty"}
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <ChevronRight className="size-4 text-muted-foreground" />
            </ItemActions>
          </Item>
        );
      })}
    </ItemGroup>
  );
}
