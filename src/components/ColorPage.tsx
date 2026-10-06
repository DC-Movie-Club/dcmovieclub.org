import { cn } from "@/lib/utils";
import { colorVars, type PageColors } from "@/config/pages";
import { HomeLink } from "@/components/HomeLink";
import { SiteFooter } from "@/components/SiteFooter";
import { textStyles } from "@/components/textStyles";

// A full-bleed page in its color roles (see colorRoles), from the page's
// Firestore doc. `contentClassName` sets the spacing between sections. The
// header sits 32px above the first one; a page whose first card has a sticker
// or heading overhanging its top edge adds the overhang to that margin.
export function ColorPage({
  colors,
  header,
  contentClassName,
  children,
}: {
  colors: PageColors;
  header: React.ReactNode;
  contentClassName?: string;
  children: React.ReactNode;
}) {
  return (
    // The negative margin cancels the layout's bottom padding (reserved for the
    // nav) so the color runs to the bottom edge; pb-36 re-adds that clearance.
    <div
      className="-mb-24 min-h-screen bg-page-bg px-6 pt-5 pb-36 sm:pt-6"
      style={colorVars(colors)}
    >
      <div className="mx-auto max-w-3xl">
        <HomeLink />
        {header}
      </div>
      <div
        className={cn(
          "mx-auto mt-8 flex max-w-3xl flex-col gap-14",
          contentClassName,
        )}
      >
        {children}
      </div>
      <SiteFooter className="mt-20" />
    </div>
  );
}

// Outlined cream lettering in the page's ink color
export function PageTitle({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <h1 className={cn(textStyles.titleLettering, className)}>
      {children}
    </h1>
  );
}
