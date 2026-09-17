import { Markdown } from "@/components/Markdown";
import { copySlots } from "@/config/copy";
import { getCopy } from "@/lib/copy";

export default async function CodeOfConduct() {
  const { content, updatedAt } = await getCopy(copySlots.conduct.key);

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl uppercase tracking-wide">
        Community Guidelines &amp; Code of Conduct
      </h1>
      {updatedAt && (
        <p className="mt-2 text-sm uppercase tracking-wider text-muted-foreground">
          Last updated{" "}
          {new Date(updatedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
            timeZone: "America/New_York",
          })}
        </p>
      )}
      <Markdown className="mt-10">{content}</Markdown>
    </article>
  );
}
