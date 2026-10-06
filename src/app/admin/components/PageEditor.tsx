"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, Maximize2, Minimize2, Undo2 } from "lucide-react";
import {
  colorRoles,
  colorVars,
  isHexColor,
  navPages,
  pageTemplates,
  sectionTemplate,
  type ColorRoleKey,
  type NavColors,
  type PageColors,
  type PageKey,
} from "@/config/pages";
import { savePage } from "@/app/admin/actions/pages";
import {
  ColorFields,
  NavColorFields,
} from "@/app/admin/components/ColorFields";
import {
  outlineItems,
  PageOutline,
} from "@/app/admin/components/PageOutline";
import { PagePreview } from "@/app/admin/components/PagePreview";
import { SectionFields } from "@/app/admin/components/SectionFields";
import { useLeaveGuard } from "@/app/admin/hooks/useLeaveGuard";
import { useSaveShortcuts } from "@/app/admin/hooks/useSaveShortcuts";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { PageData } from "@/components/pages/PageBody";
import type { PageContent, PageSection } from "@/lib/pages";

type Draft = {
  title: string;
  subtitle: string;
  // "" is a color that isn't set
  colors: Record<ColorRoleKey, string>;
  navColors: NavColors;
  sections: PageSection[];
};

function draftOf(page: PageContent): Draft {
  return {
    title: page.title,
    subtitle: page.subtitle,
    colors: Object.fromEntries(
      Object.values(colorRoles).map((role) => [
        role.key,
        page.colors[role.key] ?? "",
      ]),
    ) as Record<ColorRoleKey, string>,
    navColors: Object.fromEntries(
      navPages.map((nav) => [nav.key, page.navColors[nav.key] ?? ""]),
    ),
    sections: page.sections,
  };
}

// Leaves out colors that aren't set, and any still being typed
function colorsOf(draft: Draft): PageColors {
  return Object.fromEntries(
    Object.entries(draft.colors).filter(([, hex]) => isHexColor(hex)),
  );
}

// The colors a section's text sits in on the page, so its rich text fields can
// show it that way: the page's own, but Home's About text is in the About
// page's band (see HomePage)
function textColorsOf(
  page: PageKey,
  section: string,
  draft: Draft,
  data: PageData,
): PageColors {
  const home = pageTemplates.home;
  if (page === home.key && section === home.sections.about.key) {
    return data.aboutPage?.colors ?? {};
  }
  return colorsOf(draft);
}

function navColorsOf(draft: Draft): NavColors {
  return Object.fromEntries(
    Object.entries(draft.navColors).filter(([, hex]) => isHexColor(hex)),
  );
}

function same(a: unknown, b: unknown) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// The outline's items are "title", "colors", "nav" and the template's section
// keys
function itemChanged(draft: Draft, base: Draft, item: string) {
  if (item === "title") {
    return draft.title !== base.title || draft.subtitle !== base.subtitle;
  }
  if (item === "colors") return !same(draft.colors, base.colors);
  if (item === "nav") return !same(draft.navColors, base.navColors);
  return !same(
    draft.sections.find((s) => s.key === item),
    base.sections.find((s) => s.key === item),
  );
}

function withItemFrom(draft: Draft, base: Draft, item: string): Draft {
  if (item === "title") {
    return { ...draft, title: base.title, subtitle: base.subtitle };
  }
  if (item === "colors") return { ...draft, colors: base.colors };
  if (item === "nav") return { ...draft, navColors: base.navColors };
  return {
    ...draft,
    sections: draft.sections.map((s) =>
      s.key === item ? (base.sections.find((b) => b.key === item) ?? s) : s,
    ),
  };
}

function savedAt(page: PageContent) {
  if (!page.updatedAt) return null;
  return new Date(page.updatedAt).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function liveStatus(page: PageContent) {
  const when = savedAt(page);
  if (!when) return "Not saved yet";
  const by = page.updatedByName ? ` by ${page.updatedByName}` : "";
  return `Live on the site · saved ${when}${by}`;
}

function conflictNote(theirs: PageContent) {
  const who = theirs.updatedByName ?? "Another admin";
  const when = savedAt(theirs);
  const at = when ? ` (${when})` : "";
  return `${who} saved this page${at} while you were editing. Load their version to start again from it, or overwrite it with yours.`;
}

function TitleFields({
  draft,
  hasSubtitle,
  onChange,
}: {
  draft: Draft;
  hasSubtitle: boolean;
  onChange: (fields: Partial<Pick<Draft, "title" | "subtitle">>) => void;
}) {
  return (
    <FieldGroup>
      <Field>
        <FieldLabel htmlFor="page-title">Title</FieldLabel>
        <Input
          id="page-title"
          value={draft.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <FieldDescription>The big lettering at the top of the page.</FieldDescription>
      </Field>
      {hasSubtitle && (
        <Field>
          <FieldLabel htmlFor="page-subtitle">Subtitle</FieldLabel>
          <Input
            id="page-subtitle"
            value={draft.subtitle}
            placeholder="No subtitle"
            onChange={(e) => onChange({ subtitle: e.target.value })}
          />
          <FieldDescription>The line under the title.</FieldDescription>
        </Field>
      )}
    </FieldGroup>
  );
}

// Edits one page: the outline lists its parts, the form edits the picked part,
// and the preview shows the whole page with every unsaved change. Save
// publishes the page.
export function PageEditor({
  initialPage,
  initialItem,
  data,
}: {
  initialPage: PageContent;
  initialItem: string | null;
  data: PageData;
}) {
  const router = useRouter();
  const pageKey = initialPage.key;
  const template = pageTemplates[pageKey];
  const [saved, setSaved] = useState(initialPage);
  const [draft, setDraft] = useState(() => draftOf(initialPage));
  // Remounts the form, whose rich text fields only read their value on mount
  const [revision, setRevision] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<PageContent | null>(null);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // Hides the form so the preview gets the whole canvas. On phones, where
  // they don't fit side by side, it's the Edit/Preview switch.
  const [previewOnly, setPreviewOnly] = useState(false);

  const base = useMemo(() => draftOf(saved), [saved]);
  const items = outlineItems(pageKey, (item) => itemChanged(draft, base, item));
  // Opens on the first section, since copy is what changes most; a page with
  // no sections opens on its first part
  const [selected, setSelected] = useState(
    () =>
      (
        items.find((item) => item.key === initialItem) ??
        items.find((item) => sectionTemplate(pageKey, item.key)) ??
        items[0]
      ).key,
  );
  const current = items.find((item) => item.key === selected) ?? items[0];

  const isDirty = items.some((item) => item.dirty);
  const isValid = [
    ...Object.values(draft.colors),
    ...Object.values(draft.navColors),
  ].every((hex) => !hex || isHexColor(hex));
  const canSave = isDirty && isValid && !saving;
  const guard = useLeaveGuard(isDirty);

  const select = (item: string) => {
    setSelected(item);
    setPreviewOnly(false);
    window.history.replaceState(null, "", `?edit=${item}`);
  };

  const load = (page: PageContent) => {
    setSaved(page);
    setDraft(draftOf(page));
    setRevision((r) => r + 1);
    setConflict(null);
  };

  const save = async (force = false) => {
    setSaving(true);
    setError("");
    try {
      const result = await savePage({
        page: pageKey,
        draft: {
          title: draft.title,
          subtitle: draft.subtitle,
          colors: colorsOf(draft),
          navColors: navColorsOf(draft),
          sections: draft.sections,
        },
        baselineUpdatedAt: saved.updatedAt,
        force,
      });
      if (result.ok) {
        setSaved(result.saved);
        setDraft(draftOf(result.saved));
        setConflict(null);
        return true;
      }
      setConflict(result.conflict);
    } catch {
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
    return false;
  };

  const leave = async (andSave: boolean) => {
    const href = guard.pending;
    guard.cancel();
    if (!href || (andSave && !(await save()))) return;
    router.push(href);
  };

  useSaveShortcuts(canSave, () => save());

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
  else if (saving) status = "Saving…";
  else if (!isValid) status = "Colors need to be hex values, like #a2390a";
  else if (isDirty) status = "Unsaved changes. The site updates when you save.";
  else status = liveStatus(saved);

  const section = draft.sections.find((s) => s.key === current.key);
  let form: React.ReactNode;
  if (current.key === "title") {
    form = (
      <TitleFields
        draft={draft}
        hasSubtitle={template.subtitle}
        onChange={(fields) => setDraft((d) => ({ ...d, ...fields }))}
      />
    );
  } else if (current.key === "colors") {
    form = (
      <ColorFields
        colors={draft.colors}
        onChange={(role, value) =>
          setDraft((d) => ({ ...d, colors: { ...d.colors, [role]: value } }))
        }
      />
    );
  } else if (current.key === "nav") {
    form = (
      <NavColorFields
        colors={draft.navColors}
        onChange={(page, value) =>
          setDraft((d) => ({
            ...d,
            navColors: { ...d.navColors, [page]: value },
          }))
        }
      />
    );
  } else if (section) {
    form = (
      <SectionFields
        name={current.label}
        item={sectionTemplate(pageKey, section.key)?.item}
        section={section}
        update={(fn) => updateSection(section.key, fn)}
      />
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col md:flex-row">
      <aside className="max-h-60 shrink-0 overflow-y-auto border-b md:max-h-none md:w-52 md:border-r md:border-b-0">
        <PageOutline
          page={pageKey}
          items={items}
          selected={current.key}
          onSelect={select}
        />
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-x-2 gap-y-2 border-b px-4 py-2.5">
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <h1 className="text-sm font-semibold">{template.label}</h1>
            <p
              role="status"
              className={cn(
                "truncate text-xs text-muted-foreground",
                (error || !isValid) && "text-destructive",
              )}
            >
              {status}
            </p>
          </div>
          <Tabs
            value={previewOnly ? "preview" : "edit"}
            onValueChange={(value) => setPreviewOnly(value === "preview")}
            className="md:hidden"
          >
            <TabsList>
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button
            variant="ghost"
            size="sm"
            nativeButton={false}
            render={
              <a href={template.href} target="_blank" rel="noopener noreferrer" />
            }
          >
            View live
            <ArrowUpRight />
          </Button>
          {isDirty && (
            <Button
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={() => setConfirmDiscard(true)}
            >
              Discard
            </Button>
          )}
          <Button size="sm" onClick={() => save()} disabled={!canSave}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </header>

        <div className="flex min-h-0 flex-1">
          <section
            aria-label={current.label}
            className={cn(
              "flex min-h-0 w-full flex-col overflow-y-auto md:w-[22rem] md:shrink-0 md:border-r xl:w-[26rem]",
              previewOnly && "hidden",
            )}
          >
            <div className="flex flex-col gap-5 p-5">
              <div className="flex min-h-7 items-center justify-between gap-3">
                <h2 className="font-semibold">{current.label}</h2>
                {current.dirty && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => {
                      setDraft((d) => withItemFrom(d, base, current.key));
                      setRevision((r) => r + 1);
                    }}
                  >
                    <Undo2 />
                    Undo changes
                  </Button>
                )}
              </div>
              <div
                key={`${current.key}:${revision}`}
                style={colorVars(textColorsOf(pageKey, current.key, draft, data))}
              >
                {form}
              </div>
            </div>
          </section>

          <section
            aria-label="Preview"
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col bg-muted/50",
              !previewOnly && "max-md:hidden",
            )}
          >
            <div className="flex h-10 items-center gap-3 px-4 text-xs text-muted-foreground">
              <span className="font-medium">Preview</span>
              <Button
                variant="ghost"
                size="xs"
                className="ml-auto max-md:hidden"
                onClick={() => setPreviewOnly((p) => !p)}
              >
                {previewOnly ? <Minimize2 /> : <Maximize2 />}
                {previewOnly ? "Show the form" : "Bigger preview"}
              </Button>
            </div>
            <PagePreview
              page={{ key: pageKey, ...draft, colors: colorsOf(draft) }}
              data={data}
              selected={current.key}
              className="mx-4 mb-4 flex-1 rounded-lg border shadow-sm"
            />
          </section>
        </div>
      </div>

      <Dialog
        open={conflict !== null}
        onOpenChange={(open) => {
          if (!open) setConflict(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Someone else saved this page</DialogTitle>
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
              {saving ? "Saving…" : "Overwrite with mine"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard your changes?</DialogTitle>
            <DialogDescription>
              {`Everything you changed on ${template.label} goes back to what's live on the site.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmDiscard(false)}>
              Keep editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                load(saved);
                setConfirmDiscard(false);
              }}
            >
              Discard changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={guard.pending !== null}
        onOpenChange={(open) => {
          if (!open) guard.cancel();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{`Save your changes to ${template.label}?`}</DialogTitle>
            <DialogDescription>
              They aren&apos;t on the site yet, and leaving without saving loses
              them.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => leave(false)}>
              Don&apos;t save
            </Button>
            <Button variant="outline" onClick={guard.cancel}>
              Keep editing
            </Button>
            <Button onClick={() => leave(true)} disabled={!isValid || saving}>
              Save and continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
