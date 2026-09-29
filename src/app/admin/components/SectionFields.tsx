"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, ChevronRight, Plus, X } from "lucide-react";
import { RichTextField } from "@/app/admin/components/RichTextField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { PageSection } from "@/lib/pages";

type SectionOf<K extends PageSection["kind"]> = Extract<PageSection, { kind: K }>;
type Update<S> = (fn: (section: S) => S) => void;

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
  update,
}: {
  section: SectionOf<"links">;
  update: Update<SectionOf<"links">>;
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
              placeholder="https://…"
              spellCheck={false}
              value={item.url}
              onChange={(e) => setItem(item.key, { url: e.target.value })}
            />
            <ItemControls
              index={index}
              count={section.items.length}
              name={item.title || "link"}
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
        Add link
      </Button>
    </>
  );
}

// Answers only mount their editor while open, so a long list stays light
function FaqFields({
  section,
  update,
}: {
  section: SectionOf<"faq">;
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
                  aria-label={isOpen ? "Hide answer" : "Show answer"}
                  aria-expanded={isOpen}
                  onClick={() => toggle(item.key)}
                >
                  <ChevronRight
                    className={cn("transition-transform", isOpen && "rotate-90")}
                  />
                </Button>
                <Input
                  aria-label="Question"
                  placeholder="Question"
                  value={item.question}
                  onChange={(e) => setItem(item.key, { question: e.target.value })}
                />
                <ItemControls
                  index={index}
                  count={section.items.length}
                  name={item.question || "question"}
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
                  label={`Answer to ${item.question}`}
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
        Add question
      </Button>
    </>
  );
}

export function SectionFields({
  name,
  section,
  update,
}: {
  name: string;
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
      return (
        <LinksFields
          section={section}
          update={(fn) => update((s) => (s.kind === "links" ? fn(s) : s))}
        />
      );
    case "faq":
      return (
        <FaqFields
          section={section}
          update={(fn) => update((s) => (s.kind === "faq" ? fn(s) : s))}
        />
      );
  }
}
