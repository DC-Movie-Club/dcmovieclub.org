{/* Simple contact page. Likely a form or mailto link to hello@dcmovieclub.org.
    May also surface social links. */}

import { ExternalLink } from "@/components/ui/link";
import { HomeLink } from "@/components/HomeLink";

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 pt-5 pb-16 sm:pt-6">
      <HomeLink />
      <h1 className="text-4xl uppercase tracking-wide">Contact</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Get in touch with DC Movie Club.
      </p>
      <ExternalLink
        href="mailto:hello@dcmovieclub.org"
        className="mt-6 inline-block text-lg text-primary underline underline-offset-4"
      >
        hello@dcmovieclub.org
      </ExternalLink>
    </div>
  );
}
