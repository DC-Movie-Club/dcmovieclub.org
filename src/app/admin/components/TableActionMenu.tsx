"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import {
  $deleteTableColumnAtSelection,
  $deleteTableRowAtSelection,
  $getTableCellNodeFromLexicalNode,
  $getTableNodeFromLexicalNodeOrThrow,
  $insertTableColumnAtSelection,
  $insertTableRowAtSelection,
  type TableCellNode,
} from "@lexical/table";
import { $getNodeByKey, $getSelection, $isRangeSelection } from "lexical";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Anchor = {
  cellKey: string;
  top: number;
  left: number;
};

export function TableActionMenuPlugin() {
  const [editor] = useLexicalComposerContext();
  const isEditable = useLexicalEditable();
  const [anchor, setAnchor] = useState<Anchor | null>(null);
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditable) {
      setAnchor(null);
      setOpen(false);
      return;
    }
    return editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          setAnchor(null);
          return;
        }
        const cellNode = $getTableCellNodeFromLexicalNode(
          selection.anchor.getNode()
        );
        if (!cellNode) {
          setAnchor(null);
          return;
        }
        const element = editor.getElementByKey(cellNode.getKey());
        if (!element) return;
        const rect = element.getBoundingClientRect();
        setAnchor({
          cellKey: cellNode.getKey(),
          top: rect.top + window.scrollY + 4,
          left: rect.right + window.scrollX - 22,
        });
      });
    });
  }, [editor, isEditable]);

  useEffect(() => {
    setOpen(false);
  }, [anchor?.cellKey]);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, [open]);

  if (!anchor || !isEditable) return null;

  const run = (fn: (cell: TableCellNode) => void) => {
    editor.update(() => {
      const cell = $getNodeByKey(anchor.cellKey);
      if (!cell) return;
      cell.selectStart();
      fn(cell as TableCellNode);
    });
    setOpen(false);
  };

  return createPortal(
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label="Table actions"
        className="absolute z-50 inline-flex size-5 items-center justify-center rounded border border-border bg-background shadow-sm hover:bg-muted"
        style={{ top: anchor.top, left: anchor.left }}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
      >
        <ChevronDown className="size-3" />
      </button>
      {open && (
        <div
          ref={menuRef}
          className="absolute z-50 min-w-[180px] rounded-md border border-border bg-background py-1 text-sm shadow-md"
          style={{ top: anchor.top + 22, left: Math.max(8, anchor.left - 160) }}
        >
          <MenuItem onClick={() => run(() => $insertTableRowAtSelection(false))}>
            Insert row above
          </MenuItem>
          <MenuItem onClick={() => run(() => $insertTableRowAtSelection(true))}>
            Insert row below
          </MenuItem>
          <MenuItem onClick={() => run(() => $insertTableColumnAtSelection(false))}>
            Insert column left
          </MenuItem>
          <MenuItem onClick={() => run(() => $insertTableColumnAtSelection(true))}>
            Insert column right
          </MenuItem>
          <div className="my-1 border-t border-border" />
          <MenuItem onClick={() => run(() => $deleteTableRowAtSelection())}>
            Delete row
          </MenuItem>
          <MenuItem onClick={() => run(() => $deleteTableColumnAtSelection())}>
            Delete column
          </MenuItem>
          <MenuItem
            destructive
            onClick={() =>
              run((cell) => {
                $getTableNodeFromLexicalNodeOrThrow(cell).remove();
              })
            }
          >
            Delete table
          </MenuItem>
        </div>
      )}
    </>,
    document.body
  );
}

function MenuItem({
  children,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "block w-full px-3 py-1.5 text-left hover:bg-muted",
        destructive && "text-destructive hover:bg-destructive/10"
      )}
    >
      {children}
    </button>
  );
}
