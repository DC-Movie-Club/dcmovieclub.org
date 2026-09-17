{/* Simple contact page. Likely a form or mailto link to hello@dcmovieclub.org.
    May also surface social links and Discord invite. */}

import { ExternalLink } from "@/components/ui/link";

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
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
