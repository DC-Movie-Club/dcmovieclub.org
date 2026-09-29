import { Children } from "react";
import type { Components, ExtraProps } from "react-markdown";
import { cn } from "@/lib/utils";
import { CardSurface } from "@/components/CardSurface";

function textContent(node: ExtraProps["node"]): string {
  if (!node) return "";
  return node.children
    .map((child) =>
      child.type === "text"
        ? child.value
        : child.type === "element"
          ? textContent(child)
          : "",
    )
    .join("");
}

// A fixed angle lifts the far end of a long heading well above the card, so the
// tilt shrinks with length to keep that rise roughly constant (capped at 3deg).
function headingTilt(heading: string) {
  return -Math.min(3, 30 / Math.max(heading.length, 1));
}

function CardSection({
  id,
  heading,
  children,
}: {
  id?: string;
  heading: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="relative flex scroll-mt-8 flex-col items-start">
      <CardSurface />
      {heading}
      <div
        className={cn(
          "relative self-stretch px-6 pb-8 sm:px-8",
          heading ? "pt-4" : "pt-8",
        )}
      >
        {children}
      </div>
    </section>
  );
}

// A small negative margin lets the label's top poke over the card's edge while
// it stays in flow, so long headings can wrap. `inkClassName` sets
// `--outline-ink` for the label's outline and shadow.
function CardLabel({
  text,
  inkClassName,
  children,
}: {
  text: string;
  inkClassName: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      className={cn(
        "relative -mt-2.5 ml-4 mr-4 origin-bottom-left text-3xl uppercase leading-none tracking-wide text-cream outlined-lettering sm:-mt-3 sm:ml-6 sm:text-4xl",
        inkClassName,
      )}
      style={{ rotate: `${headingTilt(text)}deg` }}
    >
      {children}
    </h2>
  );
}

// A cream card with `label` as an outlined label on its top edge, inked in the
// page's ink color
export function SectionCard({
  id,
  label,
  children,
}: {
  id?: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <CardSection
      id={id}
      heading={
        label ? (
          <CardLabel text={label} inkClassName="outline-ink-page-ink">
            {label}
          </CardLabel>
        ) : null
      }
    >
      {children}
    </CardSection>
  );
}

// Renders `<Markdown sections={{ depth: 2 }}>` output as section cards, each
// with its heading as the card's label
export function sectionCardOverrides(inkClassName: string): Components {
  return {
    section: ({ children }) => {
      const parts = Children.toArray(children);
      const [heading, body] = parts.length > 1 ? parts : [null, parts[0]];
      return <CardSection heading={heading}>{body}</CardSection>;
    },
    h2: ({ node, children }) => (
      <CardLabel text={textContent(node)} inkClassName={inkClassName}>
        {children}
      </CardLabel>
    ),
  };
}
