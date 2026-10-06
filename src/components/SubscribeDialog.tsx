import { cn } from "@/lib/utils";
import { socials } from "@/config/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CornerCloseButton } from "@/components/CornerCloseButton";

// Substack's signup form. Its page can't be styled or told to focus its email
// field from here, but its background is our cream, so on a cream surface it
// reads as part of the page.
export function SubstackSignup({ className }: { className?: string }) {
  return (
    <iframe
      src={`${socials.substack.href}/embed`}
      title="Substack signup form"
      className={cn("h-80 w-full border-0", className)}
    />
  );
}

// The signup form in a cream dialog, opened by `trigger` with `children`
// inside it
export function SubscribeDialog({
  trigger,
  children,
}: {
  trigger: React.ReactElement;
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger render={trigger}>{children}</DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md"
        surfaceClassName="bg-cream"
      >
        <DialogTitle className="sr-only">Subscribe to our newsletter</DialogTitle>
        <SubstackSignup />
        <CornerCloseButton />
      </DialogContent>
    </Dialog>
  );
}
