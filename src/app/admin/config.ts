export const adminTabs = [
  { href: "/admin/users", label: "Users" },
  { href: "/admin/content", label: "Content" },
] as const;

export const ADMIN_DEFAULT_TAB = adminTabs[0].href;
