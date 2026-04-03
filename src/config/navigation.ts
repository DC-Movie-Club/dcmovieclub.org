import {
  House,
  Ticket,
  Newspaper,
  Users,
  Handshake,
  Mail,
} from "lucide-react";
import { Instagram } from "@/components/icons/Instagram";

export const routes = {
  home: {
    key: "home",
    label: "Home",
    labelShort: "Home",
    href: "/",
    icon: House,
  },
  events: {
    key: "events",
    label: "Events",
    labelShort: "Events",
    href: "/events",
    icon: Ticket,
  },
  blog: {
    key: "blog",
    label: "Blog",
    labelShort: "Blog",
    href: "/blog",
    icon: Newspaper,
  },
  about: {
    key: "about",
    label: "About",
    labelShort: "About",
    href: "/about",
    icon: Users,
  },
  partnerships: {
    key: "partnerships",
    label: "Partnerships",
    labelShort: "Partner",
    href: "/partnerships",
    icon: Handshake,
  },
  contact: {
    key: "contact",
    label: "Contact",
    labelShort: "Contact",
    href: "/contact",
    icon: Mail,
  },
  instagram: {
    key: "instagram",
    label: "Link in Bio",
    labelShort: "Links",
    href: "/instagram",
    icon: Instagram,
  },
} as const;
