import {
  House,
  Ticket,
  Newspaper,
  ScrollText,
  Handshake,
  Mail,
} from "lucide-react";
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
    icon: ScrollText,
  },
  partnerships: {
    key: "partnerships",
    label: "Partnerships",
    labelShort: "Partner",
    href: "/partnerships",
    icon: Handshake,
  },
  // Writes to us rather than opening a page
  contact: {
    key: "contact",
    label: "Contact",
    labelShort: "Contact",
    href: "mailto:hello@dcmovieclub.org",
    icon: Mail,
  },
} as const;

export const socials = {
  instagram: { key: "instagram", label: "Instagram", href: "https://www.instagram.com/dcmovieclub/", icon: Instagram },
  letterboxd: { key: "letterboxd", label: "Letterboxd", href: "https://letterboxd.com/DCMovieClub/", icon: Letterboxd },
  substack: { key: "substack", label: "Substack", href: "https://dcmovieclub.substack.com", icon: Substack },
  youtube: { key: "youtube", label: "YouTube", href: "https://www.youtube.com/@DCMovieClub", icon: Youtube },
} as const;
