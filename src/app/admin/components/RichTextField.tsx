"use client";

import { useEffect, useRef, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
} from "@lexical/markdown";
import {
  editorTheme,
  MarkdownEditorPlugins,
  MarkdownToolbar,
  NODES,
  TRANSFORMERS,
} from "@/app/admin/components/markdownEditor";
import { markdownStyles } from "@/components/markdownStyles";

// Loading markdown into the editor can normalize it, so an edit that ends up
// back where it started reports the original markdown, not the normalized one.
// That keeps an untouched field equal to what's saved.
function MarkdownChangePlugin({
  initial,
  onChange,
}: {
  initial: string;
  onChange: (markdown: string) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const latest = useRef(onChange);
  useEffect(() => {
    latest.current = onChange;
  });

  useEffect(() => {
    const read = () =>
      editor.getEditorState().read(() => $convertToMarkdownString(TRANSFORMERS));
    const normalized = read();
    return editor.registerUpdateListener(({ dirtyElements, dirtyLeaves }) => {
      if (dirtyElements.size === 0 && dirtyLeaves.size === 0) return;
      const markdown = read();
      latest.current(markdown === normalized ? initial : markdown);
    });
  }, [editor, initial]);

  return null;
}

// A rich text editor for one markdown field. It reads `value` once when it
// mounts; remount it (with a new `key`) to load a different value.
export function RichTextField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (markdown: string) => void;
  label: string;
}) {
  const [initial] = useState(value);
  const [anchorElem, setAnchorElem] = useState<HTMLDivElement | null>(null);
  const [isLinkEditMode, setIsLinkEditMode] = useState(false);

  const initialConfig = {
    namespace: "rich-text-field",
    theme: editorTheme(markdownStyles.h2),
    nodes: NODES,
    editorState: () => $convertFromMarkdownString(initial, TRANSFORMERS),
    onError: (e: Error) => {
      throw e;
    },
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="rounded-lg border border-input bg-card">
        <MarkdownToolbar
          setIsLinkEditMode={setIsLinkEditMode}
          className="rounded-t-lg"
        />
        <div ref={setAnchorElem} className="relative px-4 py-3">
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                aria-label={label}
                aria-placeholder="Start writing..."
                placeholder={
                  <div className="pointer-events-none absolute top-3 left-4 font-dcmc text-muted-foreground">
                    Start writing...
                  </div>
                }
                className="min-h-16 font-dcmc text-charcoal outline-none"
              />
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
      </div>
      <MarkdownEditorPlugins
        anchorElem={anchorElem}
        isLinkEditMode={isLinkEditMode}
        setIsLinkEditMode={setIsLinkEditMode}
      />
      <MarkdownChangePlugin initial={initial} onChange={onChange} />
    </LexicalComposer>
  );
}
