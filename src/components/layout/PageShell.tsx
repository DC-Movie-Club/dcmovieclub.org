import { cn } from "@/lib/utils";
import { colorVars, type PageColors } from "@/config/pages";
import { HomeLink } from "@/components/layout/HomeLink";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { textStyles } from "@/components/system/textStyles";
import { Container } from "@/components/layout/Container";

// A page in its color roles (see colorRoles), from the page's Firestore doc,
// or the defaults without them. Its background runs to the bottom edge, the
// footer closes it (at the bottom of the screen when the page is short), and
// its end stays clear of the nav.
export function PageShell({
  colors = {},
  children,
}: {
  colors?: PageColors;
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex min-h-screen flex-col bg-page-bg pb-36"
      style={colorVars(colors)}
    >
      {children}
      <Container className="mt-auto pt-20">
        <SiteFooter />
      </Container>
    </div>
  );
}

// At full size the lettering fits about this many letters across a small
// (320px) phone, so a title with a longer word steps down a size on phones
const PHONE_LETTERS = 11;

function fitsPhone(title: string) {
  const longest = Math.max(...title.split(/\s+/).map((word) => word.length));
  return longest <= PHONE_LETTERS;
}

// The top of a page: the way home, the title in outlined lettering, an
// optional subtitle, and an optional button (`action`) at the end of the row,
// or under them on phones
export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <Container className="pt-5 sm:pt-6">
      <HomeLink />
      <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex grow flex-col gap-4">
          <h1
            className={cn(
              textStyles.titleLettering,
              !fitsPhone(title) && "text-4xl",
            )}
          >
            {title}
          </h1>
          {subtitle && <p className={textStyles.pageSubtitle}>{subtitle}</p>}
        </div>
        {action}
      </header>
    </Container>
  );
}

// A page's content under its header, as a column of sections. It starts 32px
// below the header; a page whose first card has a label poking over its top
// edge adds the overhang to that, and sets its own spacing, by `className`.
export function PageContent({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Container className={cn("mt-8 flex flex-col gap-14", className)}>
      {children}
    </Container>
  );
}
