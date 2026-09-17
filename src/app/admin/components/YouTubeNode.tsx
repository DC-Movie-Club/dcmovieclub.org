"use client";

// Adapted from the Lexical playground's YouTubeNode and YouTubePlugin (v0.43.0)

import { useEffect, useState } from "react";
import type { JSX } from "react";
import {
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type EditorConfig,
  type ElementFormatType,
  type LexicalCommand,
  type LexicalNode,
  type NodeKey,
  type Spread,
} from "lexical";
import type { ElementTransformer } from "@lexical/markdown";
import { BlockWithAlignableContents } from "@lexical/react/LexicalBlockWithAlignableContents";
import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from "@lexical/react/LexicalDecoratorBlockNode";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { markdownStyles } from "@/components/markdownStyles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { parseYouTubeId, youTubeWatchUrl } from "@/lib/youtube";

export type SerializedYouTubeNode = Spread<
  { videoID: string },
  SerializedDecoratorBlockNode
>;

export class YouTubeNode extends DecoratorBlockNode {
  __id: string;

  static getType(): string {
    return "youtube";
  }

  static clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__format, node.__key);
  }

  static importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    return $createYouTubeNode(serializedNode.videoID).updateFromJSON(
      serializedNode
    );
  }

  exportJSON(): SerializedYouTubeNode {
    return {
      ...super.exportJSON(),
      videoID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  createDOM(): HTMLElement {
    const div = document.createElement("div");
    div.className = markdownStyles.embed;
    return div;
  }

  updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.getLatest().__id;
  }

  getTextContent(): string {
    return youTubeWatchUrl(this.__id);
  }

  decorate(_editor: unknown, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    return (
      <BlockWithAlignableContents
        className={{
          base: embedBlockTheme.base || "",
          focus: embedBlockTheme.focus || "",
        }}
        format={this.__format}
        nodeKey={this.getKey()}
      >
        <YouTubeEmbed videoId={this.__id} />
      </BlockWithAlignableContents>
    );
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID);
}

export function $isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined
): node is YouTubeNode {
  return node instanceof YouTubeNode;
}

// Stored as a markdown autolink on its own line; the public renderer turns that into an embed
export const YOUTUBE: ElementTransformer = {
  dependencies: [YouTubeNode],
  export: (node) =>
    $isYouTubeNode(node) ? `<${youTubeWatchUrl(node.getId())}>` : null,
  regExp: /^<https:\/\/www\.youtube\.com\/watch\?v=([\w-]{11})>\s?$/,
  replace: (parentNode, _children, match) => {
    parentNode.replace($createYouTubeNode(match[1]));
  },
  type: "element",
};

export const INSERT_YOUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  "INSERT_YOUTUBE_COMMAND"
);

// Adapted from the playground's AutoEmbedDialog: Embed stays disabled until the link parses
export function InsertYouTubeDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const [text, setText] = useState("");
  const videoId = parseYouTubeId(text);

  const close = () => {
    setText("");
    onOpenChange(false);
  };

  const embed = (event: React.FormEvent) => {
    event.preventDefault();
    if (!videoId) return;
    editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, videoId);
    close();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent>
        <form onSubmit={embed} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Embed YouTube video</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="youtube-url">Video link</Label>
            <Input
              id="youtube-url"
              value={text}
              onChange={(event) => setText(event.target.value)}
              placeholder="https://www.youtube.com/watch?v=…"
              aria-invalid={text.trim() !== "" && !videoId}
              autoFocus
            />
            {text.trim() !== "" && !videoId && (
              <p className="text-xs text-destructive">
                That doesn&apos;t look like a YouTube video link.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" disabled={!videoId}>
              Embed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function YouTubePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([YouTubeNode])) {
      throw new Error("YouTubePlugin: YouTubeNode not registered on editor");
    }

    return editor.registerCommand<string>(
      INSERT_YOUTUBE_COMMAND,
      (payload) => {
        $insertNodeToNearestRoot($createYouTubeNode(payload));
        return true;
      },
      COMMAND_PRIORITY_EDITOR
    );
  }, [editor]);

  return null;
}
