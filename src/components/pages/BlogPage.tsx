import { cn } from "@/lib/utils";
import type { PageView } from "@/lib/pages";
import { latestPost } from "@/lib/posts";
import { EmptyState } from "@/components/layout/EmptyState";
import { PageContent, PageHeader, PageShell } from "@/components/layout/PageShell";
import { SectionHeader } from "@/components/layout/SectionHeader";
import { TileGrid } from "@/components/layout/TileGrid";
import { Tile } from "@/components/system/Tile";
import { textStyles } from "@/components/system/textStyles";
import { SubscribeCard } from "@/components/posts/SubscribeDialog";
import { LatestPost } from "@/components/posts/LatestPost";
import {
  BleedCover,
  DatePill,
  SubscribeButton,
} from "@/components/posts/PostParts";
import type { SubstackPost } from "@/types/post";

function PostTile({ post }: { post: SubstackPost }) {
  return (
    <Tile
      href={post.link}
      opens
      badge={<DatePill pubDate={post.pubDate} className="absolute -top-3.5 left-4" />}
      className="flex flex-col"
    >
      <BleedCover post={post} sizes="(min-width: 640px) 380px, 100vw" />
      <div
        className={cn(
          "relative flex min-w-0 flex-col gap-1.5 px-4 pt-3 pb-4",
          !post.imageUrl && "pt-7",
        )}
      >
        <h3 className={cn("line-clamp-3", textStyles.tileTitle)}>
          {post.title}
        </h3>
        {post.description && (
          <p className={cn("line-clamp-2", textStyles.tileDek)}>
            {post.description}
          </p>
        )}
      </div>
    </Tile>
  );
}

function Posts({ posts }: { posts: SubstackPost[] }) {
  if (posts.length === 0) {
    return <EmptyState>No posts yet. Check back soon!</EmptyState>;
  }

  const latest = latestPost(posts);
  const more = posts.filter((post) => post !== latest);

  return (
    <>
      {latest && <LatestPost post={latest} priority />}

      <SubscribeCard />

      {more.length > 0 && (
        <section className="flex flex-col gap-6">
          <SectionHeader title="Older posts" />
          <TileGrid columns={2} badged>
            {more.map((post) => (
              <li key={post.link}>
                <PostTile post={post} />
              </li>
            ))}
          </TileGrid>
        </section>
      )}
    </>
  );
}

export function BlogPage({
  page,
  posts,
}: {
  page: PageView;
  posts: SubstackPost[];
}) {
  return (
    <PageShell colors={page.colors}>
      <PageHeader
        title={page.title}
        subtitle={page.subtitle}
        action={<SubscribeButton />}
      />
      <PageContent className="mt-14">
        <Posts posts={posts} />
      </PageContent>
    </PageShell>
  );
}
