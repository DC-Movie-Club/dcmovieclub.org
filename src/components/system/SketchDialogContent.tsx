import { X } from "lucide-react";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { Pill } from "@/components/system/Pill";
import { SketchShape } from "@/components/system/SketchShape";

// A round close button straddling the popup's top-right corner
function CornerCloseButton() {
  return (
    <DialogClose
      render={
        <Pill
          variant="cream"
          round
          icon={X}
          aria-label="Close"
          className="absolute -top-7 -right-7"
        />
      }
    />
  );
}

// A dialog's popup on the public site: hand-drawn cream with a faint edge,
// and a round close button on its corner unless `closeButton` is false
export function SketchDialogContent({
  closeButton = true,
  children,
  ...props
}: Omit<React.ComponentProps<typeof DialogContent>, "surface" | "showCloseButton"> & {
  closeButton?: boolean;
}) {
  return (
    <DialogContent
      showCloseButton={false}
      surface={
        <SketchShape
          radius="rounded-xl"
          fill="bg-cream"
          line="border-2 border-charcoal opacity-20"
        />
      }
      {...props}
    >
      {children}
      {closeButton && <CornerCloseButton />}
    </DialogContent>
  );
}
