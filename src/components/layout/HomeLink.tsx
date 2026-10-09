import { ArrowLeft } from "lucide-react";
import { routes } from "@/config/navigation";
import { Pill } from "@/components/system/Pill";

// Back to home, above a page's title. The negative margin lines the arrow up
// with the title while the button's tint reaches past it.
export function HomeLink() {
  return (
    <Pill
      variant="ghost"
      size="lg"
      href={routes.home.href}
      icon={ArrowLeft}
      className="-mx-2.5 mb-3"
    >
      {routes.home.label}
    </Pill>
  );
}
