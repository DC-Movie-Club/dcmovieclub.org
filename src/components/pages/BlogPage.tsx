import { cn } from "@/lib/utils";
import type { PageView } from "@/lib/pages";
import { latestPost } from "@/lib/posts";
import { ColorPage, PageTitle } from "@/components/ColorPage";
import { CreamCard } from "@/components/CreamCard";
import { OpensOverlay } from "@/components/OpensOverlay";
import { textStyles } from "@/components/textStyles";
import { SubscribeCard } from "@/components/SubscribeDialog";
import { LatestPost } from "@/components/posts/LatestPost";
import {
  BleedCover,
  DatePill,
  SubscribeButton,
} from "@/components/posts/PostParts";
import type { SubstackPost } from "@/types/post";

function PostTile({ post }: { post: SubstackPost }) {
  return (
    <a
      href={post.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group/tile relative flex h-full flex-col rounded-xl transition-transform hover:-rotate-1 hover:scale-102 focus-ring"
    >
      <div
        aria-hidden
        className="absolute inset-px rounded-xl bg-cream sketch"
      />
      <div
        aria-hidden
        className="absolute inset-0 rounded-xl border-[2.5px] border-page-edge transition-colors ink group-hover/tile:border-page-accent-edge"
      />
      <BleedCover
        post={post}
        sizes="(min-width: 640px) 380px, 100vw"
        roundedClassName="rounded-t-xl"
        lineClassName="border-[2.5px] border-page-edge transition-colors group-hover/tile:border-page-accent-edge"
      />
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
      <OpensOverlay
        className="group-hover/tile:opacity-100"
        washClassName="inset-px rounded-xl sketch"
      />
      <DatePill pubDate={post.pubDate} className="absolute -top-3.5 left-4" />
    </a>
  );
}

function Posts({ posts }: { posts: SubstackPost[] }) {
  if (posts.length === 0) {
    return (
      <CreamCard>
        <p className={textStyles.cardEmpty}>
          No posts yet. Check back soon!
        </p>
      </CreamCard>
    );
  }

  const latest = latestPost(posts);
  const more = posts.filter((post) => post !== latest);

  return (
    <>
      {latest && <LatestPost post={latest} priority />}

      <SubscribeCard />

      {more.length > 0 && (
        <section className="flex flex-col gap-6">
          <h2 className={textStyles.pageHeading}>Older posts</h2>
          <ul className="grid gap-x-4 gap-y-8 sm:grid-cols-2">
            {more.map((post) => (
              <li key={post.link}>
                <PostTile post={post} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function BlogHeader({ page }: { page: PageView }) {
  return (
    <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-4">
        <PageTitle>{page.title}</PageTitle>
        {page.subtitle && (
          <p className={textStyles.pageSubtitle}>{page.subtitle}</p>
        )}
      </div>
      <SubscribeButton className="self-start sm:self-auto" />
    </header>
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
    <ColorPage
      colors={page.colors}
      header={<BlogHeader page={page} />}
      contentClassName="mt-14"
    >
      <Posts posts={posts} />
    </ColorPage>
  );
}
