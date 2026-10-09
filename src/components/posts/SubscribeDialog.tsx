import { cn } from "@/lib/utils";
import { socials } from "@/config/navigation";
import { Dialog, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card } from "@/components/system/Card";
import { SketchDialogContent } from "@/components/system/SketchDialogContent";

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
    <Card label="Subscribe">
      <SubstackSignup className={cn(COMPACT_SIGNUP, "-mt-6 -mb-4")} />
    </Card>
  );
}

// The signup form in a plain card, as on home
export function SubscribePlainCard() {
  return (
    <Card>
      <SubstackSignup className={cn(COMPACT_SIGNUP, "-my-4")} />
    </Card>
  );
}

// The signup form in a cream dialog, opened by `trigger`, a button with its
// content: rendered on the server, it arrives drawn, so content given to the
// DialogTrigger instead wouldn't reach it
export function SubscribeDialog({ trigger }: { trigger: React.ReactElement }) {
  return (
    <Dialog>
      <DialogTrigger render={trigger} />
      <SketchDialogContent className="sm:max-w-md">
        <DialogTitle className="sr-only">Subscribe to our newsletter</DialogTitle>
        <SubstackSignup />
      </SketchDialogContent>
    </Dialog>
  );
}
