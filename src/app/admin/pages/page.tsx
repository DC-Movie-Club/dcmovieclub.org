import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pageTemplates } from "@/config/pages";
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
  colors,
}: {
  href: string;
  label: string;
  description: string;
  colors: string[];
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

export default async function PagesPage() {
  const templates = Object.values(pageTemplates);
  const pages = await Promise.all(
    templates.map((template) => readPage(template.key)),
  );

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
    </ItemGroup>
  );
}
