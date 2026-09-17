// `headings` mirrors how each page renders the slot's Headings, so the editor
// can preview them the same way: "labels" are outlined card labels
// (sectionCardOverrides), "plain" is the default Markdown heading.
export const copySlots = {
  about: { key: "about", label: "About", headings: "labels" },
  faq: { key: "faq", label: "FAQ", headings: "plain" },
  events: { key: "events", label: "Events", headings: "plain" },
  partnerships: { key: "partnerships", label: "Partnerships", headings: "labels" },
  conduct: { key: "conduct", label: "Code of Conduct", headings: "plain" },
} as const;

export type CopySlotKey = keyof typeof copySlots;

export function isCopySlotKey(value: string): value is CopySlotKey {
  return Object.hasOwn(copySlots, value);
}
