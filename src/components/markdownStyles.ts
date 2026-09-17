// Shared by the public renderer and the admin editor so editing looks like the live page.
// Everything is DCMC (caps only), so headings and body are told apart by size,
// ink strength, and tracking rather than by typeface.
export const markdownStyles = {
  h1: "mt-12 text-3xl uppercase tracking-wider text-charcoal first:mt-0",
  h2: "mt-12 text-2xl uppercase tracking-wider text-charcoal first:mt-0",
  h3: "mt-8 text-xl uppercase tracking-wider text-charcoal first:mt-0",
  p: "mt-4 text-base leading-relaxed tracking-normal text-charcoal/75 first:mt-0",
  ul: "mt-4 flex list-disc flex-col gap-1.5 pl-6 text-base tracking-normal text-charcoal/75 first:mt-0 marker:text-rust",
  ol: "mt-4 flex list-decimal flex-col gap-1.5 pl-6 text-base tracking-normal text-charcoal/75 first:mt-0 marker:text-rust",
  blockquote: "mt-4 border-l-2 border-rust/40 pl-4 italic text-charcoal/75 first:mt-0",
  hr: "my-10 border-t-2 border-charcoal/20",
  details: "mt-4 rounded-lg border-2 border-charcoal/20 px-4 py-3 first:mt-0",
  summary: "cursor-pointer text-xl uppercase tracking-wider text-charcoal",
  embed: "mt-6 first:mt-0",
  link: "text-rust underline decoration-rust/40 underline-offset-4",
  bold: "font-bold",
  italic: "italic",
} as const;
