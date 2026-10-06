"use client";

import { useRef, useState } from "react";
import { ChevronRight, ImageOff, LoaderCircle } from "lucide-react";
import { getLinkPreview } from "@/app/admin/actions/link-preview";
import { capitalize, ItemList } from "@/app/admin/components/ItemList";
import { RichTextField } from "@/app/admin/components/RichTextField";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { webUrl } from "@/lib/link-preview";
import { plainText } from "@/lib/plain-text";
import { cn } from "@/lib/utils";
import type { CardItem, PageSection } from "@/lib/pages";

type SectionOf<K extends PageSection["kind"]> = Extract<PageSection, { kind: K }>;
type Update<S> = (fn: (section: S) => S) => void;

function newItemKey() {
  return crypto.randomUUID().slice(0, 8);
}

function HeadingField({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>Heading</FieldLabel>
      <Input
        id={id}
        value={value}
        placeholder="No heading"
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

function TextFields({
  name,
  section,
  update,
}: {
  name: string;
  section: SectionOf<"text">;
  update: Update<SectionOf<"text">>;
}) {
  return (
    <FieldGroup>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <Field>
        <FieldTitle>Text</FieldTitle>
        <RichTextField
          label={name}
          value={section.content}
          onChange={(content) => update((s) => ({ ...s, content }))}
        />
        {!section.content.trim() && (
          <FieldDescription>
            This part of the page is hidden while it has no text.
          </FieldDescription>
        )}
      </Field>
    </FieldGroup>
  );
}

function LinksFields({
  section,
  noun,
  update,
}: {
  section: SectionOf<"links" | "tags">;
  noun: string;
  update: Update<SectionOf<"links" | "tags">>;
}) {
  const setItem = (key: string, fields: { title?: string; url?: string }) =>
    update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.key === key ? { ...item, ...fields } : item,
      ),
    }));
  const isTags = section.kind === "tags";

  return (
    <FieldGroup>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <FieldSet>
        <FieldLegend variant="label">{`${capitalize(noun)}s`}</FieldLegend>
        <ItemList
          items={section.items}
          noun={noun}
          nameOf={(item) => item.title}
          onChange={(items) => update((s) => ({ ...s, items }))}
          onAdd={() =>
            update((s) => ({
              ...s,
              items: [...s.items, { key: newItemKey(), title: "", url: "" }],
            }))
          }
          head={(item) => (
            <Input
              aria-label={isTags ? "Name" : "Title"}
              placeholder={isTags ? "Name" : "Title"}
              value={item.title}
              autoFocus={!item.title && !item.url}
              onChange={(e) => setItem(item.key, { title: e.target.value })}
            />
          )}
          body={(item) => (
            <Input
              aria-label="Link"
              placeholder={isTags ? "Link (optional)" : "https://…"}
              spellCheck={false}
              value={item.url}
              className="text-muted-foreground focus-visible:text-foreground"
              onChange={(e) => setItem(item.key, { url: e.target.value })}
            />
          )}
        />
      </FieldSet>
    </FieldGroup>
  );
}

type PreviewStatus = "loading" | "failed" | "no-image" | null;

const previewMessages = {
  loading: "Getting the picture and headline from this link…",
  failed:
    "Couldn't read this link, so the card has no picture. You can still type its headline and outlet.",
  "no-image": "This link's site has no preview picture, so the card shows without one.",
} as const;

function CardThumbnail({ image, loading }: { image: string; loading: boolean }) {
  const [broken, setBroken] = useState("");
  let content: React.ReactNode = <ImageOff className="size-3.5" />;
  if (loading) content = <LoaderCircle className="size-3.5 animate-spin" />;
  else if (image && image !== broken) {
    content = (
      // A plain img, since next/image only loads from listed sites and these
      // pictures come from whichever site the link is on
      <img
        src={image}
        alt=""
        referrerPolicy="no-referrer"
        className="size-full object-cover"
        onError={() => setBroken(image)}
      />
    );
  }
  return (
    <div className="flex aspect-video h-8 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-muted text-muted-foreground">
      {content}
    </div>
  );
}

// Pasting a link, or typing one and leaving the field, fills the card from
// what the link's site offers for previews. A new link brings its own picture,
// so it replaces the old one even when the site has none; the headline and
// outlet are replaced only by ones the site has.
function CardLinkField({
  item,
  status,
  setStatus,
  setItem,
  fillFrom,
}: {
  item: CardItem;
  status: PreviewStatus;
  setStatus: (status: PreviewStatus) => void;
  setItem: (fields: Partial<CardItem>) => void;
  // Fills the card unless its link changed again since `link` was read
  fillFrom: (link: string, fields: Partial<CardItem>) => void;
}) {
  // The link the card was last filled from. A saved link counts as filled; a
  // link that couldn't be read is tried again.
  const filledFrom = useRef<string | null>(item.url.trim());

  const fill = async (value: string) => {
    const link = value.trim();
    if (link === filledFrom.current || !webUrl(link)) return;
    filledFrom.current = link;
    setStatus("loading");
    const preview = await getLinkPreview(link).catch(() => null);
    if (filledFrom.current !== link) return;
    if (!preview) filledFrom.current = null;
    setStatus(!preview ? "failed" : preview.image ? null : "no-image");
    fillFrom(link, {
      image: preview?.image ?? "",
      ...(preview?.title && { title: preview.title }),
      ...(preview?.source && { source: preview.source }),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <CardThumbnail image={item.image} loading={status === "loading"} />
      <Input
        aria-label="Link"
        placeholder="Paste a link"
        spellCheck={false}
        value={item.url}
        autoFocus={!item.title && !item.url}
        className="text-muted-foreground focus-visible:text-foreground"
        onChange={(e) => {
          setItem({ url: e.target.value });
          const { inputType } = e.nativeEvent as InputEvent;
          if (inputType === "insertFromPaste" || inputType === "insertFromDrop") {
            fill(e.target.value);
          }
        }}
        onBlur={(e) => fill(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") fill(e.currentTarget.value);
        }}
      />
    </div>
  );
}

function CardsFields({
  section,
  noun,
  update,
}: {
  section: SectionOf<"cards">;
  noun: string;
  update: Update<SectionOf<"cards">>;
}) {
  // Kept here rather than in each row's link field so the message under the
  // row can say how reading its link went
  const [statuses, setStatuses] = useState<Record<string, PreviewStatus>>({});
  const setItem = (key: string, fields: Partial<CardItem>) =>
    update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.key === key ? { ...item, ...fields } : item,
      ),
    }));
  const fillFrom = (key: string, link: string, fields: Partial<CardItem>) =>
    update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.key === key && item.url.trim() === link
          ? { ...item, ...fields }
          : item,
      ),
    }));

  return (
    <FieldGroup>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <FieldSet>
        <FieldLegend variant="label">{`${capitalize(noun)}s`}</FieldLegend>
        <FieldDescription>
          Each one is a card with a picture. Paste a link to an article or
          video, and its picture, headline and outlet fill in from the site.
        </FieldDescription>
        <ItemList
          items={section.items}
          noun={noun}
          nameOf={(item) => item.title || item.source}
          onChange={(items) => update((s) => ({ ...s, items }))}
          onAdd={() =>
            update((s) => ({
              ...s,
              items: [
                ...s.items,
                { key: newItemKey(), title: "", url: "", source: "", image: "" },
              ],
            }))
          }
          head={(item) => (
            <CardLinkField
              item={item}
              status={statuses[item.key] ?? null}
              setStatus={(status) =>
                setStatuses((current) => ({ ...current, [item.key]: status }))
              }
              setItem={(fields) => setItem(item.key, fields)}
              fillFrom={(link, fields) => fillFrom(item.key, link, fields)}
            />
          )}
          body={(item) => {
            const status = statuses[item.key];
            return (
              <div className="flex flex-col gap-2">
                <Input
                  aria-label="Headline"
                  placeholder="Headline"
                  value={item.title}
                  onChange={(e) => setItem(item.key, { title: e.target.value })}
                />
                <Input
                  aria-label="Outlet"
                  placeholder="Outlet, like City Cast DC"
                  value={item.source}
                  onChange={(e) => setItem(item.key, { source: e.target.value })}
                />
                {status && (
                  <p role="status" className="px-1 text-xs text-muted-foreground">
                    {previewMessages[status]}
                  </p>
                )}
              </div>
            );
          }}
        />
      </FieldSet>
    </FieldGroup>
  );
}

// Text only mounts its editor while open, so a long list stays light
function FaqFields({
  section,
  noun,
  update,
}: {
  section: SectionOf<"faq">;
  noun: string;
  update: Update<SectionOf<"faq">>;
}) {
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(key)) next.add(key);
      return next;
    });

  const setItem = (key: string, fields: { question?: string; answer?: string }) =>
    update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.key === key ? { ...item, ...fields } : item,
      ),
    }));

  return (
    <FieldGroup>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <FieldSet>
        <FieldLegend variant="label">{`${capitalize(noun)}s`}</FieldLegend>
        <FieldDescription>
          Each one opens on the page to show its text.
        </FieldDescription>
        <ItemList
          items={section.items}
          noun={noun}
          nameOf={(item) => item.question}
          onChange={(items) => update((s) => ({ ...s, items }))}
          onAdd={() => {
            const key = newItemKey();
            update((s) => ({
              ...s,
              items: [...s.items, { key, question: "", answer: "" }],
            }));
            setOpen((current) => new Set(current).add(key));
          }}
          head={(item) => {
            const isOpen = open.has(item.key);
            return (
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={isOpen ? "Hide text" : "Show text"}
                  aria-expanded={isOpen}
                  onClick={() => toggle(item.key)}
                >
                  <ChevronRight
                    className={cn("transition-transform", isOpen && "rotate-90")}
                  />
                </Button>
                <Input
                  aria-label={capitalize(noun)}
                  placeholder={capitalize(noun)}
                  value={item.question}
                  autoFocus={!item.question && !item.answer}
                  onChange={(e) =>
                    setItem(item.key, { question: e.target.value })
                  }
                />
              </div>
            );
          }}
          body={(item) =>
            open.has(item.key) ? (
              <RichTextField
                label={`Text for ${item.question || noun}`}
                value={item.answer}
                onChange={(answer) => setItem(item.key, { answer })}
              />
            ) : (
              <button
                type="button"
                className="line-clamp-2 cursor-pointer pr-2 pl-9 text-left text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toggle(item.key)}
              >
                {item.answer.trim() ? plainText(item.answer) : "No text yet"}
              </button>
            )
          }
        />
      </FieldSet>
    </FieldGroup>
  );
}

export function SectionFields({
  name,
  item,
  section,
  update,
}: {
  name: string;
  // What one list item is called, like "question"
  item?: string;
  section: PageSection;
  update: Update<PageSection>;
}) {
  switch (section.kind) {
    case "text":
      return (
        <TextFields
          name={name}
          section={section}
          update={(fn) => update((s) => (s.kind === "text" ? fn(s) : s))}
        />
      );
    case "links":
    case "tags":
      return (
        <LinksFields
          section={section}
          noun={item ?? "link"}
          update={(fn) =>
            update((s) => (s.kind === "links" || s.kind === "tags" ? fn(s) : s))
          }
        />
      );
    case "cards":
      return (
        <CardsFields
          section={section}
          noun={item ?? "link"}
          update={(fn) => update((s) => (s.kind === "cards" ? fn(s) : s))}
        />
      );
    case "faq":
      return (
        <FaqFields
          section={section}
          noun={item ?? "item"}
          update={(fn) => update((s) => (s.kind === "faq" ? fn(s) : s))}
        />
      );
  }
}
