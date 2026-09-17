import { Children } from "react";
import type { Components, ExtraProps } from "react-markdown";
import { cn } from "@/lib/utils";
import { outlinedTextStyle } from "@/components/events/outlined-text";

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

// Renders `<Markdown sections={{ depth: 2 }}>` output as cream
// cards, each with its heading as an outlined label on the card's top edge.
// `inkClassName` sets `--outline-ink` for the label's outline and shadow.
export function sectionCardOverrides(inkClassName: string): Components {
  return {
    section: ({ children }) => {
      const parts = Children.toArray(children);
      const [heading, body] = parts.length > 1 ? parts : [null, parts[0]];
      return (
        <section className="relative flex flex-col items-start">
          <div
            aria-hidden
            className="absolute inset-0 rounded-2xl border-[3px] border-page-edge bg-cream shadow-xl sketch"
          />
          {heading}
          <div
            className={cn(
              "relative self-stretch px-6 pb-8 sm:px-8",
              heading ? "pt-4" : "pt-8",
            )}
          >
            {body}
          </div>
        </section>
      );
    },
    // A small negative margin lets the label's top poke over the card's edge
    // while it stays in flow, so long headings can wrap.
    h2: ({ node, children }) => (
      <h2
        className={cn(
          "relative -mt-2.5 ml-4 mr-4 origin-bottom-left text-3xl uppercase leading-none tracking-wide text-cream sm:-mt-3 sm:ml-6 sm:text-4xl",
          inkClassName,
        )}
        style={{
          ...outlinedTextStyle,
          rotate: `${headingTilt(textContent(node))}deg`,
        }}
      >
        {children}
      </h2>
    ),
  };
}
