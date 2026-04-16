import {
  House,
  Ticket,
  Newspaper,
  Users,
  Handshake,
  Mail,
} from "lucide-react";
import { Discord } from "@/components/icons/Discord";
import { Instagram } from "@/components/icons/Instagram";
import { Letterboxd } from "@/components/icons/Letterboxd";
import { Substack } from "@/components/icons/Substack";
import { Youtube } from "@/components/icons/Youtube";

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

export const socials = {
  instagram: { key: "instagram", label: "Instagram", href: "https://www.instagram.com/dcmovieclub/", icon: Instagram },
  letterboxd: { key: "letterboxd", label: "Letterboxd", href: "https://letterboxd.com/DCMovieClub/", icon: Letterboxd },
  discord: { key: "discord", label: "Discord", href: "https://discord.com/invite/hWRfjVpPws", icon: Discord },
  substack: { key: "substack", label: "Substack", href: "https://dcmovieclub.substack.com", icon: Substack },
  youtube: { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@DCMovieClub", icon: Youtube },
} as const;
