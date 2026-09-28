export const adminTabs = {
  resources: { key: "resources", href: "/admin/resources", label: "Resources" },
  pages: { key: "pages", href: "/admin/pages", label: "Pages" },
  admins: { key: "admins", href: "/admin/admins", label: "Admins" },
} as const;

export const ADMIN_DEFAULT_TAB = adminTabs.resources.href;

export const adminSWRKeys = {
  resources: { key: "resources", swrKey: "admin-resources" },
  adminUsers: { key: "adminUsers", swrKey: "admin-users" },
} as const;
