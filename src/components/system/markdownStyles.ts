// Relative imports, so markdownStyles.test.ts can load this under node
import { cn } from "../../lib/utils.ts";
import { proseHeadings, textStyles } from "./textStyles.ts";

// Shared by the public renderer and the admin editor so editing looks like the live page.
// Everything is DCMC (caps only), so headings and body are told apart by size,
// ink strength, and tracking rather than by typeface.
export const markdownStyles = {
  h1: cn(proseHeadings.h1, "first:mt-0"),
  h2: cn(proseHeadings.h2, "first:mt-0"),
  h3: cn(proseHeadings.h3, "first:mt-0"),
  p: cn("mt-4 first:mt-0", textStyles.proseBody),
  ul: cn(
    "mt-4 flex list-disc flex-col gap-1.5 pl-6 first:mt-0 marker:text-rust",
    textStyles.proseBody,
  ),
  ol: cn(
    "mt-4 flex list-decimal flex-col gap-1.5 pl-6 first:mt-0 marker:text-rust",
    textStyles.proseBody,
  ),
  blockquote:
    "mt-4 border-l-2 border-rust/40 pl-4 italic text-page-card-text/90 first:mt-0",
  hr: "my-10 border-t-2 border-charcoal/20",
  details: "mt-4 rounded-lg border-2 border-charcoal/20 px-4 py-3 first:mt-0",
  summary: "cursor-pointer text-2xl uppercase tracking-wider text-page-card-text",
  embed: "mt-6 first:mt-0",
  link: textStyles.proseLink,
  bold: "font-bold",
  italic: "italic",
} as const;

// The same roles for HTML written elsewhere, like a Substack post, as rules on
// its wrapper. Tailwind only sees classes written out whole, so these repeat
// markdownStyles by hand; markdownStyles.test.ts keeps them in step.
export const proseHtml = cn(
  "[&>:first-child]:mt-0 [&_li>p]:mt-0",
  "[&_p]:mt-4 [&_p]:first:mt-0 [&_p]:text-base [&_p]:leading-[1.6] [&_p]:tracking-[0.04em] [&_p]:text-page-card-text/90",
  "[&_h2]:mt-10 [&_h2]:first:mt-0 [&_h2]:text-[1.75rem] [&_h2]:uppercase [&_h2]:tracking-wider [&_h2]:text-page-card-text",
  "[&_h3]:mt-8 [&_h3]:first:mt-0 [&_h3]:text-2xl [&_h3]:uppercase [&_h3]:tracking-wider [&_h3]:text-page-card-text",
  "[&_h4]:mt-6 [&_h4]:first:mt-0 [&_h4]:text-xl [&_h4]:uppercase [&_h4]:tracking-wider [&_h4]:text-page-card-text",
  "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1 [&_li::marker]:text-rust",
  "[&_blockquote]:mt-4 [&_blockquote]:border-l-2 [&_blockquote]:border-rust/40 [&_blockquote]:pl-4 [&_blockquote>:first-child]:mt-0",
  "[&_hr]:my-8 [&_hr]:border-t-2 [&_hr]:border-charcoal/20",
  textStyles.htmlLinks,
  "[&_a.button]:mt-1 [&_a.button]:inline-flex [&_a.button]:rounded-full [&_a.button]:border-2 [&_a.button]:border-page-accent-edge [&_a.button]:bg-page-accent [&_a.button]:px-4 [&_a.button]:py-1.5 [&_a.button]:text-base [&_a.button]:tracking-wider [&_a.button]:text-page-accent-text [&_a.button]:no-underline [&_a.button]:shadow-md [&_a.button]:transition-transform [&_a.button:hover]:scale-105",
  "[&_figure]:mt-5 [&_img]:h-auto [&_img]:w-full [&_img]:rounded-lg [&_img]:border-2 [&_img]:border-charcoal",
  "[&_figcaption]:mt-2 [&_figcaption]:text-center [&_figcaption]:text-sm [&_figcaption]:text-page-card-text/80",
  "[&_iframe]:mt-5 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full [&_iframe]:rounded-lg",
  "[&_mark]:bg-page-accent/25 [&_mark]:text-inherit",
);
