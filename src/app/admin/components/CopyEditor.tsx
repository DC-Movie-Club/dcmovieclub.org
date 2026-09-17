"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { diffWords, type Change } from "diff";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  createEditor,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  HeadingNode,
  QuoteNode,
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { LinkNode, AutoLinkNode } from "@lexical/link";
import { $setBlocksType } from "@lexical/selection";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  HEADING,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
  ORDERED_LIST,
  QUOTE,
  UNORDERED_LIST,
} from "@lexical/markdown";
import {
  ArrowLeft,
  Bold,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListCollapse,
  ListOrdered,
  Pilcrow,
  Quote,
} from "lucide-react";
import { saveCopy } from "@/app/admin/actions/copy";
import { DiffView } from "@/app/admin/components/DiffView";
import { FloatingTextFormatToolbar } from "@/app/admin/components/FloatingTextFormatToolbar";
import {
  FloatingLinkEditorPlugin,
  insertLink,
} from "@/app/admin/components/FloatingLinkEditorPlugin";
import { ToolbarButton } from "@/app/admin/components/ToolbarButton";
import { LINK_MATCHERS } from "@/app/admin/components/linkMatchers";
import {
  createDetailsTransformer,
  DetailsContentNode,
  DetailsNode,
  DetailsPlugin,
  DetailsSummaryNode,
  INSERT_DETAILS_COMMAND,
} from "@/app/admin/components/DetailsNode";
import {
  InsertYouTubeDialog,
  YOUTUBE,
  YouTubeNode,
  YouTubePlugin,
} from "@/app/admin/components/YouTubeNode";
import { Youtube } from "@/components/icons/Youtube";
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

// Only what the public markdown renderer can display
const SHORTCUT_TRANSFORMERS = [
  HEADING,
  QUOTE,
  UNORDERED_LIST,
  ORDERED_LIST,
  BOLD_ITALIC_STAR,
  BOLD_ITALIC_UNDERSCORE,
  BOLD_STAR,
  BOLD_UNDERSCORE,
  ITALIC_STAR,
  ITALIC_UNDERSCORE,
  LINK,
];

// Collapsibles and YouTube only convert on load and save; as typing shortcuts
// they'd fire mid-line. The details transformer reads TRANSFORMERS lazily so
// answers can contain any other block.
const DETAILS = createDetailsTransformer(() => TRANSFORMERS);
const TRANSFORMERS = [DETAILS, YOUTUBE, ...SHORTCUT_TRANSFORMERS];

const NODES = [
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  LinkNode,
  AutoLinkNode,
  YouTubeNode,
  DetailsNode,
  DetailsSummaryNode,
  DetailsContentNode,
];

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

const themeFor = (slot: (typeof copySlots)[CopySlotKey]) => ({
  embedBlock: {
    base: "",
    focus: "rounded-xl outline-2 outline-offset-2 outline-rust",
  },
  paragraph: markdownStyles.p,
  heading: {
    h1: markdownStyles.h1,
    h2: slot.headings === "labels" ? HEADING_LABEL : markdownStyles.h2,
    h3: markdownStyles.h3,
  },
  list: {
    ul: markdownStyles.ul,
    ol: markdownStyles.ol,
    nested: { listitem: "list-none" },
  },
  quote: markdownStyles.blockquote,
  details: markdownStyles.details,
  detailsSummary: cn(
    markdownStyles.summary,
    "cursor-text border-b border-dashed border-charcoal/20 pb-2"
  ),
  detailsContent: "mt-3",
  link: markdownStyles.link,
  text: {
    bold: markdownStyles.bold,
    italic: markdownStyles.italic,
  },
});

type BlockType = "p" | "h2" | "h3" | "quote";

function Toolbar({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
}) {
  const [editor] = useLexicalComposerContext();

  const setBlock = (type: BlockType) => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => {
        if (type === "h2" || type === "h3") return $createHeadingNode(type);
        if (type === "quote") return $createQuoteNode();
        return $createParagraphNode();
      });
    });
  };

  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b bg-card px-3 py-2">
      <ToolbarButton
        icon={<Bold />}
        label="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      />
      <ToolbarButton
        icon={<Italic />}
        label="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      />
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton icon={<Pilcrow />} label="Paragraph" onClick={() => setBlock("p")} />
      <ToolbarButton icon={<Heading2 />} label="Heading" onClick={() => setBlock("h2")} />
      <ToolbarButton icon={<Heading3 />} label="Subheading" onClick={() => setBlock("h3")} />
      <ToolbarButton icon={<Quote />} label="Quote" onClick={() => setBlock("quote")} />
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        icon={<List />}
        label="Bulleted list"
        onClick={() =>
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
        }
      />
      <ToolbarButton
        icon={<ListOrdered />}
        label="Numbered list"
        onClick={() =>
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
        }
      />
      <div className="mx-1 h-5 w-px bg-border" />
      <ToolbarButton
        icon={<LinkIcon />}
        label="Link"
        onClick={() => insertLink(editor, setIsLinkEditMode)}
      />
      <ToolbarButton
        icon={<Youtube />}
        label="YouTube video"
        onClick={() => setIsYouTubeDialogOpen(true)}
      />
      <ToolbarButton
        icon={<ListCollapse />}
        label="Collapsible"
        onClick={() => editor.dispatchCommand(INSERT_DETAILS_COMMAND, undefined)}
      />
      <InsertYouTubeDialog
        open={isYouTubeDialogOpen}
        onOpenChange={setIsYouTubeDialogOpen}
      />
    </div>
  );
}

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
          href="/admin/content"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Content
        </Link>
        <h2 className="font-semibold">{slot.label}</h2>
      </div>

      <LexicalComposer key={editorKey} initialConfig={initialConfig}>
        <div className="rounded-lg border border-input bg-card">
          <Toolbar setIsLinkEditMode={setIsLinkEditMode} />
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
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        <MarkdownShortcutPlugin transformers={SHORTCUT_TRANSFORMERS} />
        <YouTubePlugin />
        <DetailsPlugin />
        <FloatingTextFormatToolbar setIsLinkEditMode={setIsLinkEditMode} />
        {floatingAnchorElem && (
          <FloatingLinkEditorPlugin
            anchorElem={floatingAnchorElem}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
          />
        )}
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
