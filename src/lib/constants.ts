export const SITE_NAME = "DC Movie Club";
export const SITE_DESCRIPTION =
  "A community of film lovers in Washington, DC. We watch, discuss, and celebrate great cinema together.";
export const SITE_URL = "https://dc-movie-club.github.io/dcmovieclub.org";

export const SOCIAL_LINKS = {
  // Add social links as they become available
  // instagram: "https://instagram.com/dcmovieclub",
  // twitter: "https://twitter.com/dcmovieclub",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Movies", href: "/movies" },
  { label: "About", href: "/about" },
] as const;
