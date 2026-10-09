import { X } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";
import { Pill } from "@/components/system/Pill";

// A round close button straddling a dialog's top-right corner
export function CornerCloseButton() {
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
