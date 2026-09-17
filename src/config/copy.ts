export const copySlots = {
  about: { key: "about", label: "About" },
  faq: { key: "faq", label: "FAQ" },
  events: { key: "events", label: "Events" },
  partnerships: { key: "partnerships", label: "Partnerships" },
  conduct: { key: "conduct", label: "Code of Conduct" },
} as const;

export type CopySlotKey = keyof typeof copySlots;

export function isCopySlotKey(value: string): value is CopySlotKey {
  return Object.hasOwn(copySlots, value);
}
