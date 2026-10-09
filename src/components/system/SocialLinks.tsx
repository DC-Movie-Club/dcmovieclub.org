import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { socials } from "@/config/navigation";
import { SketchIcon } from "@/components/system/SketchIcon";
import { SmartLink } from "@/components/system/SmartLink";

// An icon that links somewhere, named by `label`: drawn in the fine pencil
// line and redrawn on hover. `className` sets its colors.
export function IconLink({
  href,
  icon,
  label,
  size,
  className,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  size: number;
  className?: string;
}) {
  return (
    <SmartLink
      href={href}
      aria-label={label}
      className={cn("block transition-colors", className)}
    >
      <SketchIcon icon={icon} size={size} redraw="parent" />
    </SmartLink>
  );
}

// The club's social accounts as a row of icon links
export function SocialLinks({
  size,
  className,
  linkClassName,
}: {
  size: number;
  className?: string;
  linkClassName?: string;
}) {
  return (
    <ul className={cn("flex items-center gap-4", className)}>
      {Object.values(socials).map((link) => (
        <li key={link.key} className="flex">
          <IconLink
            href={link.href}
            icon={link.icon}
            label={link.label}
            size={size}
            className={linkClassName}
          />
        </li>
      ))}
    </ul>
  );
}
