"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { diffWords, type Change } from "diff";
import { $getRoot, createEditor } from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import { ArrowLeft } from "lucide-react";
import { saveCopy } from "@/app/admin/actions/copy";
import { DiffView } from "@/app/admin/components/DiffView";
import {
  editorTheme,
  MarkdownEditorPlugins,
  MarkdownToolbar,
  NODES,
  TRANSFORMERS,
} from "@/app/admin/components/markdownEditor";
import { markdownStyles } from "@/components/markdownStyles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { CopySlotKey, copySlots } from "@/config/copy";
import type { CopyDoc } from "@/lib/copy";

// The conflict diff compares text the way admins see it, without markdown syntax
function markdownToPlainText(markdown: string): string {
  const editor = createEditor({
    nodes: NODES,
    onError: (e) => {
      throw e;
    },
  });
  editor.update(() => $convertFromMarkdownString(markdown, TRANSFORMERS), {
    discrete: true,
  });
  return editor.getEditorState().read(() => $getRoot().getTextContent());
}

const HEADING_LABEL = cn(
  markdownStyles.h2,
  "text-3xl text-cream outlined-lettering sm:text-4xl"
);

const themeFor = (slot: (typeof copySlots)[CopySlotKey]) =>
  editorTheme(slot.headings === "labels" ? HEADING_LABEL : markdownStyles.h2);

function MarkdownSyncPlugin({
  onChange,
}: {
  onChange: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const read = () =>
      editor
        .getEditorState()
        .read(() => onChange($convertToMarkdownString(TRANSFORMERS)));
    read();
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      read();
    });
  }, [editor, onChange]);

  return null;
}

export function CopyEditor({
  slot,
  initialDoc,
}: {
  slot: (typeof copySlots)[CopySlotKey];
  initialDoc: CopyDoc;
}) {
  const [saved, setSaved] = useState(initialDoc);
  const [editorKey, setEditorKey] = useState(0);
  const [markdown, setMarkdown] = useState<string | null>(null);
  // Loading markdown into the editor can normalize it, so dirtiness compares
  // against the editor's first export rather than the stored string
  const [baseline, setBaseline] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);
  const [conflict, setConflict] = useState<{
    theirs: CopyDoc;
    diff: Change[];
  } | null>(null);

  const isDirty = markdown !== null && markdown !== baseline;

  const handleMarkdownChange = useCallback((next: string) => {
    setMarkdown(next);
    setBaseline((current) => current ?? next);
  }, []);

  const loadIntoEditor = (doc: CopyDoc) => {
    setSaved(doc);
    setMarkdown(null);
    setBaseline(null);
    setConflict(null);
    setEditorKey((k) => k + 1);
  };

  const save = async (force = false) => {
    if (markdown === null) return;
    setSaving(true);
    setError("");
    try {
      const result = await saveCopy({
        key: slot.key,
        content: markdown,
        baselineUpdatedAt: saved.updatedAt,
        force,
      });
      if (result.ok) {
        setSaved(result.saved);
        setBaseline(result.saved.content);
        setConflict(null);
      } else {
        setConflict({
          theirs: result.conflict,
          diff: diffWords(
            markdownToPlainText(result.conflict.content),
            markdownToPlainText(markdown)
          ),
        });
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (isDirty && !saving) save();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  let status: string;
  if (error) status = error;
  else if (saving) status = "Saving...";
  else if (isDirty) status = "Unsaved changes";
  else if (saved.updatedAt)
    status = `Live · saved ${new Date(saved.updatedAt).toLocaleString()}${
      saved.updatedByName ? ` by ${saved.updatedByName}` : ""
    }`;
  else status = "Not saved yet";

  const initialConfig = {
    namespace: `copy-${slot.key}`,
    theme: themeFor(slot),
    nodes: NODES,
    editorState: () => $convertFromMarkdownString(saved.content, TRANSFORMERS),
    onError: (e: Error) => {
      throw e;
    },
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/admin/pages"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Pages
        </Link>
        <h2 className="font-semibold">{slot.label}</h2>
      </div>

      <LexicalComposer key={editorKey} initialConfig={initialConfig}>
        <div className="rounded-lg border border-input bg-card">
          <MarkdownToolbar
            setIsLinkEditMode={setIsLinkEditMode}
            collapsible
            className="sticky top-0 z-10 rounded-t-lg"
          />
          <div ref={setFloatingAnchorElem} className="relative px-5 py-4">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  aria-placeholder="Start writing..."
                  placeholder={
                    <div className="pointer-events-none absolute top-4 left-5 font-dcmc text-lg text-muted-foreground">
                      Start writing...
                    </div>
                  }
                  className="min-h-[50vh] font-dcmc text-charcoal outline-none"
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <MarkdownEditorPlugins
          anchorElem={floatingAnchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
        <MarkdownSyncPlugin onChange={handleMarkdownChange} />
      </LexicalComposer>

      <div className="flex items-center justify-between gap-3">
        <p
          className={cn(
            "text-xs text-muted-foreground",
            error && "text-destructive"
          )}
        >
          {status}
        </p>
        <div className="flex items-center gap-2">
          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadIntoEditor(saved)}
              disabled={saving}
            >
              Revert
            </Button>
          )}
          <Button size="sm" onClick={() => save()} disabled={!isDirty || saving}>
            {saving ? "Saving..." : "Save"}
          </Button>
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
            <DialogTitle>Someone else saved changes</DialogTitle>
            <DialogDescription>
              {conflict?.theirs.updatedByName ?? "Another admin"} saved at{" "}
              {conflict?.theirs.updatedAt
                ? new Date(conflict.theirs.updatedAt).toLocaleString()
                : ""}
              . Red is what they have, green is what you&apos;re adding.
            </DialogDescription>
          </DialogHeader>
          {conflict && <DiffView diff={conflict.diff} />}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => conflict && loadIntoEditor(conflict.theirs)}
              disabled={saving}
            >
              Discard mine
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
