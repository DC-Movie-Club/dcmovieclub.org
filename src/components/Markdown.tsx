import ReactMarkdown, { type Components, type ExtraProps } from "react-markdown";
import { cn } from "@/lib/utils";
import { parseYouTubeId } from "@/lib/youtube";
import { Link, ExternalLink } from "@/components/ui/link";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { markdownStyles } from "@/components/markdownStyles";

// A paragraph that is only a link to a YouTube video, e.g. `<https://www.youtube.com/watch?v=…>`
function embeddedVideoId(node: ExtraProps["node"]): string | null {
  if (node?.children.length !== 1) return null;
  const [child] = node.children;
  if (child.type !== "element" || child.tagName !== "a") return null;
  const href = child.properties.href;
  const [text] = child.children;
  if (typeof href !== "string" || text?.type !== "text" || text.value !== href) {
    return null;
  }
  return parseYouTubeId(href);
}

const components: Components = {
  h1: ({ children }) => <h2 className={markdownStyles.h1}>{children}</h2>,
  h2: ({ children }) => <h2 className={markdownStyles.h2}>{children}</h2>,
  h3: ({ children }) => <h3 className={markdownStyles.h3}>{children}</h3>,
  p: ({ node, children }) => {
    const videoId = embeddedVideoId(node);
    return videoId ? (
      <YouTubeEmbed videoId={videoId} className={markdownStyles.embed} />
    ) : (
      <p className={markdownStyles.p}>{children}</p>
    );
  },
  ul: ({ children }) => <ul className={markdownStyles.ul}>{children}</ul>,
  ol: ({ children }) => <ol className={markdownStyles.ol}>{children}</ol>,
  blockquote: ({ children }) => (
    <blockquote className={markdownStyles.blockquote}>{children}</blockquote>
  ),
  hr: () => <hr className={markdownStyles.hr} />,
  strong: ({ children }) => (
    <strong className={markdownStyles.bold}>{children}</strong>
  ),
  a: ({ href = "", children }) => {
    if (href.startsWith("/")) {
      return (
        <Link href={href} className={markdownStyles.link}>
          {children}
        </Link>
      );
    }
    if (/^https?:\/\//.test(href)) {
      return (
        <ExternalLink href={href} className={markdownStyles.link}>
          {children}
        </ExternalLink>
      );
    }
    return (
      <a href={href} className={markdownStyles.link}>
        {children}
      </a>
    );
  },
};

// Raw HTML in the markdown is ignored, so admin-written copy can't inject markup
export function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={cn("text-charcoal", className)}>
      <ReactMarkdown components={components}>{children}</ReactMarkdown>
    </div>
  );
}
