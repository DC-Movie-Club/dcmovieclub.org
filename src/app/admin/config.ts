// A full-width tab fills the window below the top bar and scrolls in its own
// panes; the others are a centered column
export const adminTabs = {
  resources: { key: "resources", href: "/admin/resources", label: "Resources", fullWidth: false },
  pages: { key: "pages", href: "/admin/pages", label: "Pages", fullWidth: true },
  admins: { key: "admins", href: "/admin/admins", label: "Admins", fullWidth: false },
} as const;

export const ADMIN_DEFAULT_TAB = adminTabs.resources.href;

export const adminSWRKeys = {
  resources: { key: "resources", swrKey: "admin-resources" },
  adminUsers: { key: "adminUsers", swrKey: "admin-users" },
} as const;
