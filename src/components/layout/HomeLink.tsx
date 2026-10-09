import { ArrowLeft } from "lucide-react";
import { routes } from "@/config/navigation";
import { Pill } from "@/components/system/Pill";

// Back to home, above a page's title. The negative margins line the arrow up
// with the title while the button's tint reaches past it, and keep the title
// where it sits.
export function HomeLink() {
  return (
    <Pill
      variant="ghost"
      size="lg"
      href={routes.home.href}
      icon={ArrowLeft}
      className="-mx-5 -mt-1 mb-3 sm:-mx-6 sm:-mt-2"
    >
      {routes.home.label}
    </Pill>
  );
}
