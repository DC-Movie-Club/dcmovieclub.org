"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Plus, X } from "lucide-react";
import { RichTextField } from "@/app/admin/components/RichTextField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { sectionKinds, type FieldsKind } from "@/config/pages";
import type { PageSection } from "@/lib/pages";

type SectionOf<K extends PageSection["kind"]> = Extract<PageSection, { kind: K }>;
type Update<S> = (fn: (section: S) => S) => void;

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function newItemKey() {
  return crypto.randomUUID().slice(0, 8);
}

function moved<T>(items: T[], from: number, to: number) {
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

function ItemControls({
  index,
  count,
  name,
  onMove,
  onRemove,
}: {
  index: number;
  count: number;
  name: string;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center">
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Move ${name} up`}
        disabled={index === 0}
        onClick={() => onMove(index - 1)}
      >
        <ArrowUp />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Move ${name} down`}
        disabled={index === count - 1}
        onClick={() => onMove(index + 1)}
      >
        <ArrowDown />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={`Remove ${name}`}
        onClick={onRemove}
      >
        <X />
      </Button>
    </div>
  );
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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>Heading</Label>
      <Input
        id={id}
        value={value}
        placeholder="No heading"
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
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
    <>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <RichTextField
        label={name}
        value={section.content}
        onChange={(content) => update((s) => ({ ...s, content }))}
      />
    </>
  );
}

function LinksFields({
  section,
  item: noun,
  update,
}: {
  section: SectionOf<"links" | "tags">;
  item: string;
  update: Update<SectionOf<"links" | "tags">>;
}) {
  const setItem = (key: string, fields: { title?: string; url?: string }) =>
    update((s) => ({
      ...s,
      items: s.items.map((item) =>
        item.key === key ? { ...item, ...fields } : item,
      ),
    }));

  return (
    <>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <ul className="flex flex-col gap-2">
        {section.items.map((item, index) => (
          <li key={item.key} className="flex items-center gap-2">
            <Input
              aria-label="Title"
              placeholder="Title"
              value={item.title}
              onChange={(e) => setItem(item.key, { title: e.target.value })}
            />
            <Input
              aria-label="Link"
              placeholder={section.kind === "tags" ? "Link (optional)" : "https://…"}
              spellCheck={false}
              value={item.url}
              onChange={(e) => setItem(item.key, { url: e.target.value })}
            />
            <ItemControls
              index={index}
              count={section.items.length}
              name={item.title || noun}
              onMove={(to) =>
                update((s) => ({ ...s, items: moved(s.items, index, to) }))
              }
              onRemove={() =>
                update((s) => ({
                  ...s,
                  items: s.items.filter((i) => i.key !== item.key),
                }))
              }
            />
          </li>
        ))}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() =>
          update((s) => ({
            ...s,
            items: [...s.items, { key: newItemKey(), title: "", url: "" }],
          }))
        }
      >
        <Plus />
        Add {noun}
      </Button>
    </>
  );
}

// Answers only mount their editor while open, so a long list stays light
function FaqFields({
  section,
  item: noun,
  update,
}: {
  section: SectionOf<"faq">;
  item: string;
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
    <>
      <HeadingField
        id={`${section.key}-heading`}
        value={section.label}
        onChange={(label) => update((s) => ({ ...s, label }))}
      />
      <ul className="flex flex-col gap-2">
        {section.items.map((item, index) => {
          const isOpen = open.has(item.key);
          return (
            <li key={item.key} className="flex flex-col gap-2 rounded-lg border p-2">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
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
                  onChange={(e) => setItem(item.key, { question: e.target.value })}
                />
                <ItemControls
                  index={index}
                  count={section.items.length}
                  name={item.question || noun}
                  onMove={(to) =>
                    update((s) => ({ ...s, items: moved(s.items, index, to) }))
                  }
                  onRemove={() =>
                    update((s) => ({
                      ...s,
                      items: s.items.filter((i) => i.key !== item.key),
                    }))
                  }
                />
              </div>
              {isOpen && (
                <RichTextField
                  label={`Text for ${item.question}`}
                  value={item.answer}
                  onChange={(answer) => setItem(item.key, { answer })}
                />
              )}
            </li>
          );
        })}
      </ul>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="self-start"
        onClick={() => {
          const key = newItemKey();
          update((s) => ({
            ...s,
            items: [...s.items, { key, question: "", answer: "" }],
          }));
          setOpen((current) => new Set(current).add(key));
        }}
      >
        <Plus />
        Add {noun}
      </Button>
    </>
  );
}

function FieldsFields({
  section,
  update,
}: {
  section: SectionOf<FieldsKind>;
  update: Update<SectionOf<FieldsKind>>;
}) {
  return Object.values(sectionKinds[section.kind].fields).map(
    (field: { key: string; label: string }) => {
      const id = `${section.key}-${field.key}`;
      return (
        <div key={field.key} className="flex flex-col gap-1.5">
          <Label htmlFor={id}>{field.label}</Label>
          <Input
            id={id}
            value={section.fields[field.key] ?? ""}
            onChange={(e) =>
              update((s) => ({
                ...s,
                fields: { ...s.fields, [field.key]: e.target.value },
              }))
            }
          />
        </div>
      );
    },
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
          item={item ?? "link"}
          update={(fn) =>
            update((s) => (s.kind === "links" || s.kind === "tags" ? fn(s) : s))
          }
        />
      );
    case "faq":
      return (
        <FaqFields
          section={section}
          item={item ?? "item"}
          update={(fn) => update((s) => (s.kind === "faq" ? fn(s) : s))}
        />
      );
    default:
      return (
        <FieldsFields
          section={section}
          update={(fn) => update((s) => ("fields" in s ? fn(s) : s))}
        />
      );
  }
}
