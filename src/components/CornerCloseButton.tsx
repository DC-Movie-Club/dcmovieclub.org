import { X } from "lucide-react";
import { DialogClose } from "@/components/ui/dialog";

// A sketched round close button straddling a dialog's top-right corner
export function CornerCloseButton() {
  return (
    <DialogClose
      render={
        <button
          type="button"
          aria-label="Close"
          className="group/close absolute -top-7 -right-7 flex size-10 items-center justify-center rounded-full text-charcoal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rust"
        />
      }
    >
      <span
        aria-hidden
        className="absolute inset-px rounded-full bg-cream shadow-md sketch-subtle group-hover/close:boil"
      />
      <span
        aria-hidden
        className="absolute inset-0 rounded-full border-2 border-charcoal opacity-25 ink-subtle group-hover/close:opacity-40 group-hover/close:boil"
      />
      <X size={18} strokeWidth={2.5} className="relative" />
    </DialogClose>
  );
}
