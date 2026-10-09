import { Card } from "@/components/system/Card";
import { textStyles } from "@/components/system/textStyles";

// A card standing in for a list with nothing in it yet
export function EmptyState({ children }: { children: string }) {
  return (
    <Card>
      <p className={textStyles.cardEmpty}>{children}</p>
    </Card>
  );
}
