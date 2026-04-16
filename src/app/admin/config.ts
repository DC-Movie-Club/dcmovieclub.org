export const adminTabs = {
  resources: { key: "resources", href: "/admin/resources", label: "Resources" },
  admins: { key: "admins", href: "/admin/admins", label: "Admins" },
  content: { key: "content", href: "/admin/content", label: "Content" },
} as const;

export const ADMIN_DEFAULT_TAB = adminTabs.resources.href;

export const adminSWRKeys = {
  resources: { key: "resources", swrKey: "admin-resources" },
  adminUsers: { key: "adminUsers", swrKey: "admin-users" },
} as const;
