"use client";

import { useState } from "react";
import {
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
} from "lexical";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { AutoLinkPlugin } from "@lexical/react/LexicalAutoLinkPlugin";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
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
import { markdownStyles } from "@/components/system/markdownStyles";
import { cn } from "@/lib/utils";

// Only what the public markdown renderer can display
export const SHORTCUT_TRANSFORMERS = [
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
export const TRANSFORMERS = [DETAILS, YOUTUBE, ...SHORTCUT_TRANSFORMERS];

export const NODES = [
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

// Styles the editor like the live page; `h2` is how the page renders a heading
export function editorTheme(h2: string) {
  return {
    embedBlock: {
      base: "",
      focus: "rounded-xl outline-2 outline-offset-2 outline-rust",
    },
    paragraph: markdownStyles.p,
    heading: {
      h1: markdownStyles.h1,
      h2,
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
      "cursor-text border-b border-dashed border-charcoal/20 pb-2",
    ),
    detailsContent: "mt-3",
    link: markdownStyles.link,
    text: {
      bold: markdownStyles.bold,
      italic: markdownStyles.italic,
    },
  };
}

type BlockType = "p" | "h2" | "h3" | "quote";

export function MarkdownToolbar({
  setIsLinkEditMode,
  collapsible = false,
  className,
}: {
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
  collapsible?: boolean;
  className?: string;
}) {
  const [editor] = useLexicalComposerContext();
  const [isYouTubeDialogOpen, setIsYouTubeDialogOpen] = useState(false);

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

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 border-b bg-card px-3 py-2",
        className,
      )}
    >
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
      {collapsible && (
        <ToolbarButton
          icon={<ListCollapse />}
          label="Collapsible"
          onClick={() => editor.dispatchCommand(INSERT_DETAILS_COMMAND, undefined)}
        />
      )}
      <InsertYouTubeDialog
        open={isYouTubeDialogOpen}
        onOpenChange={setIsYouTubeDialogOpen}
      />
    </div>
  );
}

// The plugins every markdown editor needs. `anchorElem` is where the floating
// link editor positions itself.
export function MarkdownEditorPlugins({
  anchorElem,
  isLinkEditMode,
  setIsLinkEditMode,
}: {
  anchorElem: HTMLElement | null;
  isLinkEditMode: boolean;
  setIsLinkEditMode: (isLinkEditMode: boolean) => void;
}) {
  return (
    <>
      <HistoryPlugin />
      <ListPlugin />
      <LinkPlugin />
      <AutoLinkPlugin matchers={LINK_MATCHERS} />
      <MarkdownShortcutPlugin transformers={SHORTCUT_TRANSFORMERS} />
      <YouTubePlugin />
      <DetailsPlugin />
      <FloatingTextFormatToolbar setIsLinkEditMode={setIsLinkEditMode} />
      {anchorElem && (
        <FloatingLinkEditorPlugin
          anchorElem={anchorElem}
          isLinkEditMode={isLinkEditMode}
          setIsLinkEditMode={setIsLinkEditMode}
        />
      )}
    </>
  );
}
