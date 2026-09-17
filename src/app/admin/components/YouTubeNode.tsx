"use client";

// Adapted from the Lexical playground's YouTubeNode and YouTubePlugin (v0.43.0)

import { useEffect } from "react";
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
import { youTubeWatchUrl } from "@/lib/youtube";

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
