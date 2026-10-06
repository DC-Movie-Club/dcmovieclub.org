import { cn } from "@/lib/utils";
import { socials } from "@/config/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CornerCloseButton } from "@/components/CornerCloseButton";
import { CreamCard } from "@/components/CreamCard";
import { SectionCard } from "@/components/section-cards";

// Substack's signup form. Its page can't be styled or told to focus its email
// field from here, but its background is our cream, so on a cream surface it
// reads as part of the page.
function SubstackSignup({ className }: { className?: string }) {
  return (
    <iframe
      src={`${socials.substack.href}/embed`}
      title="Substack signup form"
      loading="lazy"
      className={cn("h-80 w-full border-0", className)}
    />
  );
}

// Substack fits the form to the frame's height: at this one it drops its logo
// and tagline. The cards' negative margins pull the leftover space at its top
// and bottom into their padding.
const COMPACT_SIGNUP = "mx-auto h-[230px] max-w-md";

// The signup form in a card labelled on its top edge, as on the blog
export function SubscribeCard() {
  return (
    <SectionCard label="Subscribe">
      <SubstackSignup className={cn(COMPACT_SIGNUP, "-mt-6 -mb-4")} />
    </SectionCard>
  );
}

// The signup form in a plain card, as on home
export function SubscribePlainCard() {
  return (
    <CreamCard>
      <SubstackSignup className={cn(COMPACT_SIGNUP, "-my-4")} />
    </CreamCard>
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
