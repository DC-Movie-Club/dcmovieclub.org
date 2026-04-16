"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { diffWords, type Change } from "diff";
import type { LexicalEditor, EditorState } from "lexical";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { EditorRefPlugin } from "@lexical/react/LexicalEditorRefPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode, AutoLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  AutoLinkPlugin,
  createLinkMatcherWithRegExp,
} from "@lexical/react/LexicalAutoLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import {
  HorizontalRuleNode,
  INSERT_HORIZONTAL_RULE_COMMAND,
} from "@lexical/react/LexicalHorizontalRuleNode";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { $setBlocksType } from "@lexical/selection";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { $createParagraphNode } from "lexical";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_CHECK_LIST_COMMAND,
} from "@lexical/list";
import { CodeNode, CodeHighlightNode, $createCodeNode } from "@lexical/code";
import {
  TableNode,
  TableRowNode,
  TableCellNode,
  INSERT_TABLE_COMMAND,
} from "@lexical/table";
import { TRANSFORMERS } from "@lexical/markdown";
import {
  CalloutNode,
  $createCalloutNode,
} from "@/app/admin/components/CalloutNode";
import { TableActionMenuPlugin } from "@/app/admin/components/TableActionMenu";
import {
  getResources,
  saveResources,
  type ResourcesDoc,
} from "@/app/admin/actions/resources";
import { adminSWRKeys } from "@/app/admin/config";
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
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  ListChecks,
  Link as LinkIcon,
  Unlink,
  Pilcrow,
  Info,
  Code as CodeIcon,
  Table as TableIcon,
  Minus,
} from "lucide-react";

const theme = {
  paragraph: "mb-3 leading-relaxed",
  heading: {
    h1: "text-2xl font-semibold mt-6 mb-3",
    h2: "text-xl font-semibold mt-5 mb-2",
    h3: "text-lg font-semibold mt-4 mb-2",
  },
  list: {
    ul: "list-disc pl-6 mb-3",
    ol: "list-decimal pl-6 mb-3",
    listitem: "mb-1",
    checklist: "editor-checklist",
    listitemChecked: "editor-check-item editor-check-item-checked",
    listitemUnchecked: "editor-check-item",
  },
  link: "text-primary underline underline-offset-2",
  text: {
    bold: "font-semibold",
    italic: "italic",
    underline: "underline",
    code: "font-mono text-sm bg-muted rounded px-1 py-0.5",
  },
  quote: "border-l-2 border-muted-foreground pl-4 italic my-3",
  callout:
    "border-l-4 border-primary bg-primary/5 pl-4 pr-3 py-2 my-3 rounded-r",
  code: "font-mono text-sm bg-muted rounded px-3 py-2 my-3 block whitespace-pre overflow-x-auto",
  table: "editor-table",
  tableRow: "editor-table-row",
  tableCell: "editor-table-cell",
  tableCellHeader: "editor-table-cell editor-table-cell-header",
};

const URL_REGEX =
  /((https?:\/\/(www\.)?)|(www\.))[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/;
const EMAIL_REGEX =
  /(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))/;

const LINK_MATCHERS = [
  createLinkMatcherWithRegExp(URL_REGEX, (text) =>
    text.startsWith("http") ? text : `https://${text}`
  ),
  createLinkMatcherWithRegExp(EMAIL_REGEX, (text) => `mailto:${text}`),
];

function extractPlainText(serialized: string): string {
  if (!serialized) return "";
  try {
    const json = JSON.parse(serialized);
    const lines: string[] = [];
    const walk = (
      node: { type?: string; text?: string; children?: unknown[] },
      buf: string[]
    ): void => {
      if (typeof node.text === "string") {
        buf.push(node.text);
      }
      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child as typeof node, buf);
        }
      }
    };
    const root = json.root;
    if (root?.children) {
      for (const block of root.children) {
        const buf: string[] = [];
        walk(block, buf);
        lines.push(buf.join(""));
      }
    }
    return lines.join("\n");
  } catch {
    return "";
  }
}

function EditableController({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(editable);
  }, [editor, editable]);
  return null;
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  const format = (tag: "h1" | "h2" | "p" | "quote") => {
    editor.update(() => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection)) return;
      $setBlocksType(selection, () => {
        if (tag === "h1") return $createHeadingNode("h1");
        if (tag === "h2") return $createHeadingNode("h2");
        if (tag === "quote") return $createQuoteNode();
        return $createParagraphNode();
      });
    });
  };

  const promptLink = () => {
    const url = window.prompt("Enter URL");
    if (url === null) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b pb-2 mb-3">
      <ToolbarButton
        icon={<Bold />}
        label="Bold"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")
        }
      />
      <ToolbarButton
        icon={<Italic />}
        label="Italic"
        onClick={() =>
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")
        }
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        icon={<Pilcrow />}
        label="Paragraph"
        onClick={() => format("p")}
      />
      <ToolbarButton
        icon={<Heading1 />}
        label="Heading 1"
        onClick={() => format("h1")}
      />
      <ToolbarButton
        icon={<Heading2 />}
        label="Heading 2"
        onClick={() => format("h2")}
      />
      <div className="w-px h-5 bg-border mx-1" />
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
      <ToolbarButton
        icon={<ListChecks />}
        label="Checklist"
        onClick={() =>
          editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
        }
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        icon={<Info />}
        label="Callout"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            $setBlocksType(selection, () => $createCalloutNode());
          });
        }}
      />
      <ToolbarButton
        icon={<CodeIcon />}
        label="Code block"
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;
            $setBlocksType(selection, () => $createCodeNode());
          });
        }}
      />
      <ToolbarButton
        icon={<TableIcon />}
        label="Table"
        onClick={() =>
          editor.dispatchCommand(INSERT_TABLE_COMMAND, {
            rows: "3",
            columns: "3",
            includeHeaders: true,
          })
        }
      />
      <ToolbarButton
        icon={<Minus />}
        label="Horizontal rule"
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
      />
      <div className="w-px h-5 bg-border mx-1" />
      <ToolbarButton
        icon={<LinkIcon />}
        label="Link"
        onClick={promptLink}
      />
      <ToolbarButton
        icon={<Unlink />}
        label="Remove link"
        onClick={() =>
          editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        }
      />
    </div>
  );
}

function ToolbarButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {icon}
    </Button>
  );
}

function DiffView({ diff }: { diff: Change[] }) {
  return (
    <pre className="whitespace-pre-wrap break-words text-xs border rounded bg-muted/50 p-3 max-h-72 overflow-auto">
      {diff.map((part, i) => (
        <span
          key={i}
          className={cn(
            part.added && "bg-green-500/20",
            part.removed && "bg-red-500/20 line-through"
          )}
        >
          {part.value}
        </span>
      ))}
    </pre>
  );
}

export function ResourcesEditor({
  initialData,
}: {
  initialData: ResourcesDoc;
}) {
  const { data, mutate } = useSWR(
    adminSWRKeys.resources.swrKey,
    getResources,
    {
      fallbackData: initialData,
      revalidateOnMount: false,
    }
  );

  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [conflict, setConflict] = useState<{
    current: ResourcesDoc;
    mine: string;
    diff: Change[];
  } | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const editorRef = useRef<LexicalEditor | null>(null);

  const baseline = data;

  const startEdit = () => {
    setIsEditing(true);
    setIsDirty(false);
    setError("");
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setIsDirty(false);
    setError("");
    setResetKey((k) => k + 1);
  };

  const serializeCurrent = () =>
    JSON.stringify(editorRef.current?.getEditorState().toJSON() ?? null);

  const handleSave = async (force = false) => {
    const content = serializeCurrent();
    setSaving(true);
    setError("");
    try {
      const result = await saveResources({
        baselineUpdatedAt: baseline.updatedAt,
        content,
        force,
      });
      if (result.ok) {
        await mutate(result.saved, { revalidate: false });
        setIsEditing(false);
        setIsDirty(false);
        setConflict(null);
      } else {
        const mineText = extractPlainText(content);
        const theirsText = extractPlainText(result.conflict.content);
        setConflict({
          current: result.conflict,
          mine: content,
          diff: diffWords(theirsText, mineText),
        });
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const overwrite = async () => {
    if (!conflict) return;
    setSaving(true);
    setError("");
    try {
      const result = await saveResources({
        baselineUpdatedAt: conflict.current.updatedAt,
        content: conflict.mine,
        force: true,
      });
      if (result.ok) {
        await mutate(result.saved, { revalidate: false });
        setIsEditing(false);
        setIsDirty(false);
        setConflict(null);
      }
    } catch {
      setError("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const discard = async () => {
    if (!conflict) return;
    await mutate(conflict.current, { revalidate: false });
    setResetKey((k) => k + 1);
    setIsEditing(false);
    setIsDirty(false);
    setConflict(null);
  };

  const onChange = useCallback(
    (_state: EditorState) => {
      if (!isEditing) return;
      const current = JSON.stringify(_state.toJSON());
      setIsDirty(current !== baseline.content);
    },
    [isEditing, baseline.content]
  );

  const initialConfig = {
    namespace: "resources",
    theme,
    editable: false,
    onError: (e: Error) => {
      throw e;
    },
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
      TableNode,
      TableRowNode,
      TableCellNode,
      HorizontalRuleNode,
      CalloutNode,
    ],
    editorState: baseline.content || undefined,
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {baseline.updatedAt
            ? `Last saved ${new Date(baseline.updatedAt).toLocaleString()}${
                baseline.updatedByName || baseline.updatedBy
                  ? ` by ${baseline.updatedByName ?? baseline.updatedBy}`
                  : ""
              }`
            : ""}
        </p>
        <div className="flex items-center gap-3">
        {isEditing && isDirty && (
          <span className="text-xs text-muted-foreground">
            Unsaved changes
          </span>
        )}
        {error && <span className="text-xs text-destructive">{error}</span>}
        {isEditing ? (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={cancelEdit}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleSave(false)}
              disabled={!isDirty || saving}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={startEdit}>
            Edit
          </Button>
        )}
        </div>
      </div>

      <LexicalComposer key={resetKey} initialConfig={initialConfig}>
        <div
          className={cn(
            "rounded-md border",
            isEditing
              ? "border-input bg-card px-4 py-3"
              : "border-transparent px-0 py-0"
          )}
        >
          {isEditing && <Toolbar />}
          <div className="relative">
            <RichTextPlugin
              contentEditable={
                <ContentEditable
                  aria-placeholder="Start writing..."
                  placeholder={
                    <div className="pointer-events-none absolute inset-0 text-muted-foreground">
                      Start writing...
                    </div>
                  }
                  className={cn(
                    "outline-none min-h-[2rem]",
                    isEditing && "min-h-[12rem]"
                  )}
                />
              }
              ErrorBoundary={LexicalErrorBoundary}
            />
          </div>
        </div>
        <HistoryPlugin />
        <LinkPlugin />
        <ListPlugin />
        <CheckListPlugin />
        <TablePlugin />
        <TableActionMenuPlugin />
        <HorizontalRulePlugin />
        <AutoLinkPlugin matchers={LINK_MATCHERS} />
        <ClickableLinkPlugin />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
        <OnChangePlugin onChange={onChange} />
        <EditableController editable={isEditing} />
        <EditorRefPlugin editorRef={editorRef} />
      </LexicalComposer>


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
              {conflict?.current.updatedByName ||
              conflict?.current.updatedBy
                ? `${conflict.current.updatedByName ?? conflict.current.updatedBy} saved at `
                : "Another admin saved at "}
              {conflict?.current.updatedAt
                ? new Date(conflict.current.updatedAt).toLocaleString()
                : ""}
              {". Red is what they have, green is what you're adding."}
            </DialogDescription>
          </DialogHeader>
          {conflict && <DiffView diff={conflict.diff} />}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={discard}
              disabled={saving}
            >
              Discard mine
            </Button>
            <Button
              variant="destructive"
              onClick={overwrite}
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
