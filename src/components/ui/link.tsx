import NextLink from "next/link"
import { cn } from "@/lib/utils"

type LinkProps = React.ComponentProps<typeof NextLink>

function Link({ className, ...props }: LinkProps) {
  return (
    <NextLink
      data-slot="link"
      className={cn(
        "transition-[color,filter] duration-150 hover:text-rust hover:sketch-subtle-animated",
        className,
      )}
      {...props}
    />
  )
}

type ExternalLinkProps = React.ComponentProps<"a">

function ExternalLink({ className, ...props }: ExternalLinkProps) {
  return (
    <a
      data-slot="link"
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "transition-[color,filter] duration-150 hover:text-rust hover:sketch-subtle-animated",
        className,
      )}
      {...props}
    />
  )
}

export { Link, ExternalLink }
