import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { getRecentPosts } from "@/lib/data";
import { ExternalLink } from "@/components/ui/link";
import type { SubstackPost } from "@/types/post";

function formatDate(raw: string) {
  return new Date(raw).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PostCard({ post }: { post: SubstackPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group/post flex flex-col gap-4 border-b border-border pb-8 sm:flex-row sm:gap-6"
    >
      {post.imageUrl && (
        <div className="relative aspect-wide w-full shrink-0 overflow-hidden rounded-lg sm:aspect-square sm:w-36">
          <Image
            src={post.imageUrl}
            alt=""
            fill
            sizes="(min-width: 640px) 144px, 100vw"
            className="object-cover transition-transform group-hover/post:scale-105"
            {...(post.blurDataUrl && {
              placeholder: "blur" as const,
              blurDataURL: post.blurDataUrl,
            })}
          />
        </div>
      )}

      <div className="flex min-w-0 flex-col">
        <h2 className="text-xl uppercase tracking-wide group-hover/post:text-rust">
          {post.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatDate(post.pubDate)}
        </p>
        {post.description && (
          <p className="mt-2 line-clamp-2 text-muted-foreground">
            {post.description}
          </p>
        )}
        <span
          className={cn(
            "mt-3 inline-flex items-center gap-1.5 text-sm uppercase tracking-wide text-rust",
            "sketch-subtle group-hover/post:sketch-subtle-animated",
          )}
        >
          Read on Substack
          <ArrowUpRight size={14} />
        </span>
      </div>
    </a>
  );
}

export default async function Blog() {
  const posts = await getRecentPosts();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl uppercase tracking-wide">Blog</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        News, reviews, and dispatches from DC Movie Club.{" "}
        <ExternalLink
          href="https://dcmovieclub.substack.com"
          className="inline-flex items-center gap-1 text-rust underline"
        >
          Subscribe on Substack
          <ArrowUpRight size={16} />
        </ExternalLink>
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.link} post={post} />)
        ) : (
          <p className="text-muted-foreground">
            No posts yet — check back soon!
          </p>
        )}
      </div>
    </div>
  );
}
