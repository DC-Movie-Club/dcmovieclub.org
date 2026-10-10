import NextLink from "next/link";
import { cn } from "@/lib/utils";
import { linkKind } from "@/lib/external-links";

type SmartLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

// A link with no look of its own, beyond the keyboard focus ring every link
// shows. It opens the way its address calls for: a page on this site through
// Next's router, anywhere else in a new tab (see linkKind).
export function SmartLink({ href, className, ...rest }: SmartLinkProps) {
  const props = { ...rest, className: cn("rounded-sm focus-ring", className) };
  switch (linkKind(href)) {
    case "internal":
      return <NextLink href={href} {...props} />;
    case "external":
      return <a href={href} target="_blank" rel="noopener noreferrer" {...props} />;
    case "plain":
      return <a href={href} {...props} />;
  }
}

// A link in running text, which turns rust and redraws on hover
export function TextLink({ className, ...props }: SmartLinkProps) {
  return (
    <SmartLink
      className={cn(
        "transition-[color,filter] duration-150 hover:text-rust hover:sketch-subtle-animated",
        className,
      )}
      {...props}
    />
  );
}
