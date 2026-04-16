{/* Partnerships page: existing partners/sponsors, info on how to partner with DCMC.
    Will need a dynamic section for partner logos/descriptions and a static section
    with partnership info/contact. Abbie will provide copy and partner details. */}

import { ExternalLink } from "@/components/ui/link";

export default function Partnerships() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl uppercase tracking-wide">Partnerships</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        DC Movie Club partners with local venues, businesses, and organizations to bring
        great film experiences to the community.
      </p>
      <p className="mt-4 text-muted-foreground">
        Partner details and logos coming soon — Abbie will provide.
      </p>
      <p className="mt-8 text-muted-foreground">
        Interested in partnering?{" "}
        <ExternalLink
          href="mailto:abbie@dcmovieclub.org"
          className="text-primary underline underline-offset-4"
        >
          Reach out
        </ExternalLink>
      </p>
    </div>
  );
}
