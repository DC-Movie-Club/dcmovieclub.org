"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  SELECTION_CHANGE_COMMAND,
  COMMAND_PRIORITY_LOW,
} from "lexical";
import { $isCodeNode } from "@lexical/code";
import { TOGGLE_LINK_COMMAND, $isLinkNode } from "@lexical/link";
import { $findMatchingParent } from "@lexical/utils";
import { Bold, Italic, Link as LinkIcon, Unlink } from "lucide-react";
import { cn } from "@/lib/utils";

type Position = { top: number; left: number };

export function FloatingTextFormatToolbar() {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [position, setPosition] = useState<Position | null>(null);
  const [format, setFormat] = useState({
    bold: false,
    italic: false,
    link: false,
  });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditable) {
      setPosition(null);
      return;
    }

    const updateToolbar = () => {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection) || selection.isCollapsed()) {
          setPosition(null);
          return;
        }

        const anchorNode = selection.anchor.getNode();
        const codeParent = $findMatchingParent(anchorNode, $isCodeNode);
        if (codeParent) {
          setPosition(null);
          return;
        }

        const domSelection = window.getSelection();
        if (!domSelection || domSelection.rangeCount === 0) {
          setPosition(null);
          return;
        }
        const rect = domSelection.getRangeAt(0).getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) {
          setPosition(null);
          return;
        }

        const toolbarWidth = ref.current?.offsetWidth ?? 180;
        const toolbarHeight = ref.current?.offsetHeight ?? 32;
        const top = rect.top + window.scrollY - toolbarHeight - 8;
        const left =
          rect.left + window.scrollX + rect.width / 2 - toolbarWidth / 2;

        setPosition({ top: Math.max(8, top), left: Math.max(8, left) });

        const linkParent = $findMatchingParent(anchorNode, $isLinkNode);
        setFormat({
          bold: selection.hasFormat("bold"),
          italic: selection.hasFormat("italic"),
          link: linkParent !== null,
        });
      });
    };

    const unregister = editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      () => {
        updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_LOW
    );
    const unregisterUpdate = editor.registerUpdateListener(() => {
      updateToolbar();
    });

    document.addEventListener("selectionchange", updateToolbar);

    return () => {
      unregister();
      unregisterUpdate();
      document.removeEventListener("selectionchange", updateToolbar);
    };
  }, [editor, isEditable]);

  if (!position || !isEditable) return null;

  const promptLink = () => {
    const url = window.prompt("Enter URL");
    if (url === null) return;
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null);
  };

  return createPortal(
    <div
      ref={ref}
      className="absolute z-50 flex items-center gap-0.5 rounded-md border border-border bg-background px-1 py-1 shadow-md"
      style={{ top: position.top, left: position.left }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <FormatButton
        active={format.bold}
        label="Bold"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
      >
        <Bold className="size-3.5" />
      </FormatButton>
      <FormatButton
        active={format.italic}
        label="Italic"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
      >
        <Italic className="size-3.5" />
      </FormatButton>
      <div className="mx-1 h-4 w-px bg-border" />
      {format.link ? (
        <FormatButton
          active
          label="Remove link"
          onClick={() => editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)}
        >
          <Unlink className="size-3.5" />
        </FormatButton>
      ) : (
        <FormatButton label="Link" onClick={promptLink}>
          <LinkIcon className="size-3.5" />
        </FormatButton>
      )}
    </div>,
    document.body
  );
}

function FormatButton({
  children,
  label,
  onClick,
  active,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "inline-flex size-6 items-center justify-center rounded hover:bg-muted",
        active && "bg-muted text-foreground"
      )}
    >
      {children}
    </button>
  );
}
