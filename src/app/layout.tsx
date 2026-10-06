import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "DC Movie Club",
  description: "A community of film lovers in Washington, DC.",
};

// Runs before first paint: holds the page's entrance animations until
// PageReveal lets them play, with a timeout in case it never does
const markLoading = `document.documentElement.dataset.loading = "";
setTimeout(function () { delete document.documentElement.dataset.loading; }, 3000);`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // React's view transitions leave the page out of the animation unless the
    // root names itself inline, so navigating crossfades the whole screen
    // under the nav's own crossfade (see BottomNav)
    <html
      lang="en"
      data-scroll-behavior="smooth"
      style={{ viewTransitionName: "root" }}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: markLoading }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
