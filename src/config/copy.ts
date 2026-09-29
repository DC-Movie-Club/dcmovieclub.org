// `headings` mirrors how each page renders the slot's Headings, so the editor
// can preview them the same way: "labels" are outlined card labels
// (sectionCardOverrides), "plain" is the default Markdown heading.
export const copySlots = {
  events: { key: "events", label: "Events", headings: "plain" },
  partnerships: { key: "partnerships", label: "Partnerships", headings: "labels" },
} as const;

export type CopySlotKey = keyof typeof copySlots;

export function isCopySlotKey(value: string): value is CopySlotKey {
  return Object.hasOwn(copySlots, value);
}
