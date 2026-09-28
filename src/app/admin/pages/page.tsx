import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { copySlots } from "@/config/copy";
import { pageTemplates } from "@/config/pages";
import { getCopy } from "@/lib/copy";
import { readPage } from "@/lib/pages";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

function savedLabel(updatedAt: string | null, updatedByName: string | null) {
  if (!updatedAt) return "Empty";
  const date = new Date(updatedAt).toLocaleDateString();
  return updatedByName ? `Saved ${date} by ${updatedByName}` : `Saved ${date}`;
}

function PageItem({
  href,
  label,
  description,
  colors = [],
}: {
  href: string;
  label: string;
  description: string;
  colors?: string[];
}) {
  return (
    <Item variant="outline" render={<Link href={href} />}>
      <ItemContent>
        <ItemTitle>{label}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions>
        {colors.length > 0 && (
          <span className="flex -space-x-1.5">
            {colors.map((hex, i) => (
              <span
                key={i}
                className="size-4 rounded-full border border-background ring-1 ring-foreground/10"
                style={{ backgroundColor: hex }}
              />
            ))}
          </span>
        )}
        <ChevronRight className="size-4 text-muted-foreground" />
      </ItemActions>
    </Item>
  );
}

// Pages still on a single copy slot open the copy editor until they get a template
export default async function PagesPage() {
  const templates = Object.values(pageTemplates);
  const slots = Object.values(copySlots);
  const [pages, copies] = await Promise.all([
    Promise.all(templates.map((template) => readPage(template.key))),
    Promise.all(slots.map((slot) => getCopy(slot.key))),
  ]);

  return (
    <ItemGroup className="gap-2">
      {templates.map((template, i) => (
        <PageItem
          key={template.key}
          href={`/admin/pages/${template.key}`}
          label={template.label}
          description={savedLabel(pages[i].updatedAt, pages[i].updatedByName)}
          colors={Object.values(pages[i].colors)}
        />
      ))}
      {slots.map((slot, i) => (
        <PageItem
          key={slot.key}
          href={`/admin/pages/${slot.key}`}
          label={slot.label}
          description={savedLabel(copies[i].updatedAt, copies[i].updatedByName)}
        />
      ))}
    </ItemGroup>
  );
}
