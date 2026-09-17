// Shared by the public renderer and the admin editor so editing looks like the live page
export const markdownStyles = {
  h1: "mt-12 text-3xl uppercase tracking-wide first:mt-0",
  h2: "mt-12 text-2xl uppercase tracking-wide first:mt-0",
  h3: "mt-8 text-xl uppercase tracking-wide first:mt-0",
  p: "mt-4 text-lg leading-relaxed first:mt-0",
  ul: "mt-4 flex list-disc flex-col gap-1.5 pl-6 text-lg first:mt-0 marker:text-rust",
  ol: "mt-4 flex list-decimal flex-col gap-1.5 pl-6 text-lg first:mt-0 marker:text-rust",
  blockquote: "mt-4 border-l-2 border-rust/40 pl-4 italic first:mt-0",
  hr: "my-10 border-t-2 border-charcoal/20",
  embed: "mt-6 first:mt-0",
  link: "text-rust underline decoration-rust/40 underline-offset-4",
  bold: "font-bold",
  italic: "italic",
} as const;
