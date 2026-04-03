{/* Blog/news page. Abbie currently publishes via Substack.
    Plan is either: (a) blog lives on-site with Substack cross-posting,
    or (b) posts are pulled/syndicated from Substack automatically. Decision pending.
    Stub with a post list layout and a single placeholder post. */}

function PlaceholderPost() {
  return (
    <article className="border-b border-border pb-8">
      <h2 className="text-2xl uppercase tracking-wide">Post Title</h2>
      <p className="mt-1 text-sm text-muted-foreground">April 2, 2026</p>
      <p className="mt-3 text-muted-foreground">
        Post excerpt placeholder. This will be a summary of the blog post with a link to read
        the full article, either on-site or on Substack depending on final content strategy.
      </p>
      <span className="mt-3 inline-block text-sm uppercase tracking-wide text-primary">
        Read More &rarr;
      </span>
    </article>
  );
}

export default function Blog() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-4xl uppercase tracking-wide">Blog</h1>
      <p className="mt-6 text-lg text-muted-foreground">
        News, reviews, and dispatches from DC Movie Club.
      </p>
      <div className="mt-10 flex flex-col gap-8">
        <PlaceholderPost />
      </div>
    </div>
  );
}
