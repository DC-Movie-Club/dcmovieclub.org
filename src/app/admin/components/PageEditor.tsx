"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import {
  colorRoles,
  isHexColor,
  pageTemplates,
  sectionKinds,
  type ColorRoleKey,
  type PageColors,
} from "@/config/pages";
import { savePage } from "@/app/admin/actions/pages";
import { PagePreview } from "@/app/admin/components/PagePreview";
import { SectionFields } from "@/app/admin/components/SectionFields";
import { useSaveShortcuts } from "@/app/admin/hooks/useSaveShortcuts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { PageContent, PageSection } from "@/lib/pages";

type Draft = {
  title: string;
  // "" is a color that isn't set
  colors: Record<ColorRoleKey, string>;
  sections: PageSection[];
};

function draftOf(page: PageContent): Draft {
  return {
    title: page.title,
    colors: Object.fromEntries(
      Object.values(colorRoles).map((role) => [
        role.key,
        page.colors[role.key] ?? "",
      ]),
    ) as Record<ColorRoleKey, string>,
    sections: page.sections,
  };
}

function colorsOf(draft: Draft): PageColors {
  return Object.fromEntries(
    Object.entries(draft.colors).filter(([, hex]) => hex),
  );
}

function savedStatus(page: PageContent) {
  if (!page.updatedAt) return "Not saved yet";
  const time = new Date(page.updatedAt).toLocaleString();
  return `Live · saved ${time}${page.updatedByName ? ` by ${page.updatedByName}` : ""}`;
}

function conflictNote(theirs: PageContent) {
  const who = theirs.updatedByName ?? "Another admin";
  const when = theirs.updatedAt
    ? ` at ${new Date(theirs.updatedAt).toLocaleString()}`
    : "";
  return `${who} saved this page${when}. Load their version, or overwrite it with yours.`;
}

function ColorField({
  role,
  value,
  onChange,
}: {
  role: (typeof colorRoles)[ColorRoleKey];
  value: string;
  onChange: (value: string) => void;
}) {
  const valid = !value || isHexColor(value);
  const id = `color-${role.key}`;
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{role.label}</Label>
      <div className="flex items-center gap-2">
        <label
          className={cn(
            "relative size-8 shrink-0 cursor-pointer rounded-md border",
            !(value && valid) && "border-dashed",
          )}
          style={{ backgroundColor: value && valid ? value : undefined }}
        >
          <input
            type="color"
            aria-label={`Pick ${role.label.toLowerCase()} color`}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
            value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
          />
        </label>
        <Input
          id={id}
          value={value}
          placeholder="Not set"
          spellCheck={false}
          aria-invalid={!valid}
          className="font-mono"
          onChange={(e) => onChange(e.target.value.trim())}
        />
      </div>
    </div>
  );
}

export function PageEditor({ initialPage }: { initialPage: PageContent }) {
  const template = pageTemplates[initialPage.key];
  const [saved, setSaved] = useState(initialPage);
  const [draft, setDraft] = useState(() => draftOf(initialPage));
  // Remounts the rich text fields, which only read their value when mounted
  const [fieldsKey, setFieldsKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<PageContent | null>(null);

  const isDirty = JSON.stringify(draft) !== JSON.stringify(draftOf(saved));
  const isValid = Object.values(draft.colors).every(
    (hex) => !hex || isHexColor(hex),
  );
  const canSave = isDirty && isValid && !saving;

  const load = (page: PageContent) => {
    setSaved(page);
    setDraft(draftOf(page));
    setFieldsKey((k) => k + 1);
    setConflict(null);
  };

  const save = async (force = false) => {
    setSaving(true);
    setError("");
    try {
      const result = await savePage({
        page: saved.key,
        draft: {
          title: draft.title,
          colors: colorsOf(draft),
          sections: draft.sections,
        },
        baselineUpdatedAt: saved.updatedAt,
        force,
      });
      if (result.ok) {
        setSaved(result.saved);
        setDraft(draftOf(result.saved));
        setConflict(null);
      } else {
        setConflict(result.conflict);
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  useSaveShortcuts(canSave, () => save());

  const setColor = (role: ColorRoleKey, value: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [role]: value } }));

  const updateSection = (
    key: string,
    fn: (section: PageSection) => PageSection,
  ) =>
    setDraft((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.key === key ? fn(s) : s)),
    }));

  let status: string;
  if (error) status = error;
  else if (saving) status = "Saving...";
  else if (!isValid) status = "Colors need to be hex values, like #a2390a";
  else if (isDirty) status = "Unsaved changes";
  else status = savedStatus(saved);

  return (
    <div className="flex flex-col gap-8">
      <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-3 border-b bg-background px-4 py-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pages"
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              Pages
            </Link>
            <h2 className="font-semibold">{template.label}</h2>
          </div>
          <p
            className={cn(
              "truncate text-xs text-muted-foreground",
              (error || !isValid) && "text-destructive",
            )}
          >
            {status}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <a href={template.href} target="_blank" rel="noopener noreferrer" />
            }
          >
            View page
            <ArrowUpRight />
          </Button>
          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => load(saved)}
              disabled={saving}
            >
              Revert
            </Button>
          )}
          <Button size="sm" onClick={() => save()} disabled={!canSave}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="page-title">Title</Label>
        <Input
          id="page-title"
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
        />
      </div>

      <section className="flex flex-col gap-4">
        <h3 className="font-semibold">Colors</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {Object.values(colorRoles).map((role) => (
            <ColorField
              key={role.key}
              role={role}
              value={draft.colors[role.key]}
              onChange={(value) => setColor(role.key, value)}
            />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-semibold">Preview</h3>
          <p className="text-xs text-muted-foreground">
            How the page looks with these colors. Changes show here as you make
            them, and on the site once you save.
          </p>
        </div>
        <PagePreview
          title={draft.title}
          colors={isValid ? colorsOf(draft) : saved.colors}
          sections={draft.sections}
        />
      </section>

      <section key={fieldsKey} className="flex flex-col gap-4">
        <h3 className="font-semibold">Sections</h3>
        {draft.sections.map((section) => {
          const name =
            template.sections[section.key as keyof typeof template.sections]
              .label;
          return (
            <section key={section.key} className="rounded-lg border">
              <header className="flex items-baseline justify-between gap-3 border-b px-4 py-3">
                <h4 className="font-medium">{name}</h4>
                <span className="text-xs text-muted-foreground">
                  {sectionKinds[section.kind].label}
                </span>
              </header>
              <div className="flex flex-col gap-4 p-4">
                <SectionFields
                  name={name}
                  section={section}
                  update={(fn) => updateSection(section.key, fn)}
                />
              </div>
            </section>
          );
        })}
      </section>

      <Dialog
        open={conflict !== null}
        onOpenChange={(open) => {
          if (!open) setConflict(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Someone else saved changes</DialogTitle>
            <DialogDescription>
              {conflict && conflictNote(conflict)}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => conflict && load(conflict)}
              disabled={saving}
            >
              Load theirs
            </Button>
            <Button
              variant="destructive"
              onClick={() => save(true)}
              disabled={saving}
            >
              {saving ? "Saving..." : "Overwrite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
