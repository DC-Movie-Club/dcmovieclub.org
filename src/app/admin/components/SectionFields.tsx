"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { PageSection } from "@/lib/pages";

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

// A one-line glimpse of an answer, without its markdown
function plainText(markdown: string) {
  return markdown
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[*_#>`]|^\s*[-+]\s|^\s*\d+\.\s/gm, "")
    .replace(/\s+/g, " ")
    .trim();
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
