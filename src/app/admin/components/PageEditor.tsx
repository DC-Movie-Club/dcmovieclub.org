"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import {
  colorRoles,
  isHexColor,
  pageTemplates,
  sectionKinds,
  type ColorRoleKey,
  type PageColors,
} from "@/config/pages";
import { savePageSettings } from "@/app/admin/actions/pages";
import { PagePreview } from "@/app/admin/components/PagePreview";
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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";
import { cn } from "@/lib/utils";
import type { PageContent, PageSection } from "@/lib/pages";

type Draft = {
  title: string;
  ctaLabel: string;
  ctaHref: string;
  // "" is a color that isn't set
  colors: Record<ColorRoleKey, string>;
};

function draftOf(page: PageContent): Draft {
  return {
    title: page.title,
    ctaLabel: page.cta?.label ?? "",
    ctaHref: page.cta?.href ?? "",
    colors: Object.fromEntries(
      Object.values(colorRoles).map((role) => [
        role.key,
        page.colors[role.key] ?? "",
      ]),
    ) as Record<ColorRoleKey, string>,
  };
}

function colorsOf(draft: Draft): PageColors {
  return Object.fromEntries(
    Object.entries(draft.colors).filter(([, hex]) => hex),
  );
}

function ctaOf(draft: Draft) {
  const label = draft.ctaLabel.trim();
  const href = draft.ctaHref.trim();
  return label && href ? { label, href } : null;
}

function savedStatus(updatedAt: string | null, updatedByName: string | null) {
  if (!updatedAt) return "Not saved yet";
  const time = new Date(updatedAt).toLocaleString();
  return `Live · saved ${time}${updatedByName ? ` by ${updatedByName}` : ""}`;
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

function conflictNote(theirs: PageContent) {
  const who = theirs.updatedByName ?? "Another admin";
  const when = theirs.updatedAt
    ? ` at ${new Date(theirs.updatedAt).toLocaleString()}`
    : "";
  return `${who} changed this page's title, button, or colors${when}. Load their version, or overwrite it with yours.`;
}

function sectionSummary(section: PageSection) {
  const kind = sectionKinds[section.kind].label;
  switch (section.kind) {
    case "text":
      return section.content.trim() ? kind : `${kind} · empty`;
    case "links":
    case "faq":
      return `${kind} · ${section.items.length}`;
  }
}

export function PageEditor({ initialPage }: { initialPage: PageContent }) {
  const template = pageTemplates[initialPage.key];
  const [saved, setSaved] = useState(initialPage);
  const [draft, setDraft] = useState(() => draftOf(initialPage));
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
    setConflict(null);
  };

  const save = async (force = false) => {
    setSaving(true);
    setError("");
    try {
      const result = await savePageSettings({
        page: saved.key,
        settings: {
          title: draft.title,
          cta: ctaOf(draft),
          colors: colorsOf(draft),
        },
        baselineUpdatedAt: saved.updatedAt,
        force,
      });
      if (result.ok) load(result.saved);
      else setConflict(result.conflict);
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  useSaveShortcuts(canSave, () => save());

  const setColor = (role: ColorRoleKey, value: string) =>
    setDraft((d) => ({ ...d, colors: { ...d.colors, [role]: value } }));

  let status: string;
  if (error) status = error;
  else if (saving) status = "Saving...";
  else if (!isValid) status = "Colors need to be hex values, like #a2390a";
  else if (isDirty) status = "Unsaved changes";
  else status = savedStatus(saved.updatedAt, saved.updatedByName);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
        <a
          href={template.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          View page
          <ArrowUpRight className="size-4" />
        </a>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="page-title">Title</Label>
          <Input
            id="page-title"
            value={draft.title}
            onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-cta-label">Button text</Label>
            <Input
              id="page-cta-label"
              value={draft.ctaLabel}
              placeholder="No button"
              onChange={(e) =>
                setDraft((d) => ({ ...d, ctaLabel: e.target.value }))
              }
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="page-cta-href">Button link</Label>
            <Input
              id="page-cta-href"
              value={draft.ctaHref}
              placeholder="/code-of-conduct or https://…"
              spellCheck={false}
              onChange={(e) =>
                setDraft((d) => ({ ...d, ctaHref: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h3 className="text-sm font-medium">Colors</h3>
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
        <PagePreview
          title={draft.title}
          cta={ctaOf(draft)}
          colors={isValid ? colorsOf(draft) : saved.colors}
          sections={saved.sections}
        />
      </section>

      <div className="flex items-center justify-between gap-3 border-y py-3">
        <p
          className={cn(
            "text-xs text-muted-foreground",
            (error || !isValid) && "text-destructive",
          )}
        >
          {status}
        </p>
        <div className="flex items-center gap-2">
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

      <section className="flex flex-col gap-3">
        <h3 className="text-sm font-medium">Sections</h3>
        <ItemGroup className="gap-2">
          {saved.sections.map((section) => (
            <Item
              key={section.key}
              variant="outline"
              render={
                <Link href={`/admin/pages/${saved.key}/${section.key}`} />
              }
            >
              <ItemContent>
                <ItemTitle>
                  {
                    template.sections[
                      section.key as keyof typeof template.sections
                    ].label
                  }
                </ItemTitle>
                <ItemDescription>{sectionSummary(section)}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRight className="size-4 text-muted-foreground" />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
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
