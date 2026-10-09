import { Plus } from "lucide-react";
import { Card } from "@/components/system/Card";
import { Pill } from "@/components/system/Pill";
import { textStyles } from "@/components/textStyles";

// A card with a question (`summary`) that opens to its answer. It opens in
// one step and the answer fades in: growing it over time would redraw the
// card's edges every frame, as with ExpandableDescription. The badge turns
// to a cross while open, and boils while the card is hovered.
export function DisclosureCard({
  summary,
  children,
}: {
  summary: string;
  children: React.ReactNode;
}) {
  return (
    <Card padded={false} className="group/card">
      <details className="group/faq relative self-stretch">
        <summary className="relative flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-4 focus-ring focus-ring-rust sm:px-8 [&::-webkit-details-marker]:hidden">
          <span className={textStyles.cardQuestion}>{summary}</span>
          <Pill
            decorative
            variant="accent"
            round
            size="sm"
            withCard
            icon={Plus}
            iconClassName="transition-transform duration-300 group-open/faq:rotate-45"
          />
        </summary>
        <div className="relative mx-6 border-t border-dashed border-charcoal/20 pt-4 pb-6 group-open/faq:duration-300 motion-safe:group-open/faq:animate-in motion-safe:group-open/faq:fade-in sm:mx-8">
          {children}
        </div>
      </details>
    </Card>
  );
}
