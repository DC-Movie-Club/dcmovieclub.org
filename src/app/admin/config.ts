export const adminTabs = [
  { href: "/admin/admins", label: "Admins" },
  { href: "/admin/content", label: "Content" },
] as const;

export const ADMIN_DEFAULT_TAB = adminTabs[0].href;
