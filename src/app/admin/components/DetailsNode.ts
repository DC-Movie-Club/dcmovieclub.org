"use client";

import { useEffect } from "react";
import {
  $createParagraphNode,
  $createTextNode,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  createCommand,
  ElementNode,
  KEY_ENTER_COMMAND,
  type EditorConfig,
  type LexicalCommand,
  type LexicalNode,
  type SerializedElementNode,
} from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  type MultilineElementTransformer,
  type Transformer,
} from "@lexical/markdown";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from "@lexical/utils";

type DetailsTheme = {
  details?: string;
  detailsSummary?: string;
  detailsContent?: string;
};

function themedDiv(config: EditorConfig, key: keyof DetailsTheme) {
  const div = document.createElement("div");
  const className = (config.theme as DetailsTheme)[key];
  if (className) div.className = className;
  return div;
}

// A collapsible block: always DetailsNode → [DetailsSummaryNode, DetailsContentNode].
// The editor shows it expanded; the public site renders it as <details>.
export class DetailsNode extends ElementNode {
  static getType(): string {
    return "details";
  }

  static clone(node: DetailsNode): DetailsNode {
    return new DetailsNode(node.__key);
  }

  static importJSON(serializedNode: SerializedElementNode): DetailsNode {
    return $createDetailsNode().updateFromJSON(serializedNode);
  }

  createDOM(config: EditorConfig): HTMLElement {
    return themedDiv(config, "details");
  }

  updateDOM(): false {
    return false;
  }

  canBeEmpty(): false {
    return false;
  }
}

export class DetailsSummaryNode extends ElementNode {
  static getType(): string {
    return "details-summary";
  }

  static clone(node: DetailsSummaryNode): DetailsSummaryNode {
    return new DetailsSummaryNode(node.__key);
  }

  static importJSON(serializedNode: SerializedElementNode): DetailsSummaryNode {
    return $createDetailsSummaryNode().updateFromJSON(serializedNode);
  }

  createDOM(config: EditorConfig): HTMLElement {
    return themedDiv(config, "detailsSummary");
  }

  updateDOM(): false {
    return false;
  }

  // Enter in the question starts the answer instead of splitting the question
  insertNewAfter(): LexicalNode | null {
    const content = this.getNextSibling();
    if (!$isDetailsContentNode(content)) return null;
    const first = content.getFirstChild();
    if ($isParagraphNode(first) && first.isEmpty()) return first;
    const paragraph = $createParagraphNode();
    if (first) first.insertBefore(paragraph);
    else content.append(paragraph);
    return paragraph;
  }

  // Backspace at the start of the question shouldn't merge it into the block above
  collapseAtStart(): true {
    return true;
  }
}

export class DetailsContentNode extends ElementNode {
  static getType(): string {
    return "details-content";
  }

  static clone(node: DetailsContentNode): DetailsContentNode {
    return new DetailsContentNode(node.__key);
  }

  static importJSON(serializedNode: SerializedElementNode): DetailsContentNode {
    return $createDetailsContentNode().updateFromJSON(serializedNode);
  }

  createDOM(config: EditorConfig): HTMLElement {
    return themedDiv(config, "detailsContent");
  }

  updateDOM(): false {
    return false;
  }

  // Keeps block-level editing (Enter, Backspace) inside the answer
  isShadowRoot(): true {
    return true;
  }
}

export function $createDetailsNode(): DetailsNode {
  return new DetailsNode();
}

export function $createDetailsSummaryNode(): DetailsSummaryNode {
  return new DetailsSummaryNode();
}

export function $createDetailsContentNode(): DetailsContentNode {
  return new DetailsContentNode();
}

export function $isDetailsNode(node: LexicalNode | null | undefined): node is DetailsNode {
  return node instanceof DetailsNode;
}

export function $isDetailsSummaryNode(
  node: LexicalNode | null | undefined
): node is DetailsSummaryNode {
  return node instanceof DetailsSummaryNode;
}

export function $isDetailsContentNode(
  node: LexicalNode | null | undefined
): node is DetailsContentNode {
  return node instanceof DetailsContentNode;
}

function escapeLabel(label: string) {
  return label.replace(/[[\]]/g, (bracket) => `\\${bracket}`);
}

// Stored as a remark-directive container: `:::details[Question]`, the answer
// as markdown, then `:::`. Import-only; there's no typing shortcut for it.
export function createDetailsTransformer(
  getTransformers: () => Array<Transformer>
): MultilineElementTransformer {
  return {
    dependencies: [DetailsNode, DetailsSummaryNode, DetailsContentNode],
    regExpStart: /^:::details(?:\[(.*)\])?\s*$/,
    regExpEnd: /^:::\s*$/,
    replace: (rootNode, _children, startMatch, _endMatch, linesInBetween, isImport) => {
      if (!isImport || !linesInBetween) return false;
      const transformers = getTransformers();

      const summary = $createDetailsSummaryNode();
      $convertFromMarkdownString(startMatch[1] ?? "", transformers, summary);
      // The label imports as a paragraph; the summary holds its inline content directly
      const labelParagraph = summary.getFirstChild();
      if ($isElementNode(labelParagraph)) {
        summary.append(...labelParagraph.getChildren());
        labelParagraph.remove();
      }

      const content = $createDetailsContentNode();
      $convertFromMarkdownString(linesInBetween.join("\n"), transformers, content);
      if (content.isEmpty()) content.append($createParagraphNode());

      rootNode.append($createDetailsNode().append(summary, content));
    },
    export: (node, exportChildren) => {
      if (!$isDetailsNode(node)) return null;
      const [summary, content] = node.getChildren();
      const label = $isDetailsSummaryNode(summary)
        ? escapeLabel(exportChildren(summary))
        : "";
      const body = $isDetailsContentNode(content)
        ? $convertToMarkdownString(getTransformers(), content)
        : "";
      return `:::details[${label}]\n${body}\n:::`;
    },
    type: "multiline-element",
  };
}

export const INSERT_DETAILS_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_DETAILS_COMMAND"
);

export function DetailsPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([DetailsNode, DetailsSummaryNode, DetailsContentNode])) {
      throw new Error("DetailsPlugin: details nodes not registered on editor");
    }

    return mergeRegister(
      // Keep the three-node structure intact after edits like select-all + delete
      editor.registerNodeTransform(DetailsNode, (node) => {
        const [summary, content, ...extra] = node.getChildren();
        if ($isDetailsSummaryNode(summary) && $isDetailsContentNode(content) && extra.length === 0) {
          return;
        }
        for (const child of node.getChildren()) {
          if ($isDetailsSummaryNode(child) || $isDetailsContentNode(child)) {
            child.getChildren().forEach((grandchild) => node.insertBefore(grandchild));
          } else {
            node.insertBefore(child);
          }
        }
        node.remove();
      }),
      editor.registerNodeTransform(DetailsSummaryNode, (node) => {
        if ($isDetailsNode(node.getParent())) return;
        node.replace($createParagraphNode().append(...node.getChildren()));
      }),
      editor.registerNodeTransform(DetailsContentNode, (node) => {
        if ($isDetailsNode(node.getParent())) return;
        node.getChildren().forEach((child) => node.insertBefore(child));
        node.remove();
      }),

      editor.registerCommand(
        INSERT_DETAILS_COMMAND,
        () => {
          const placeholder = $createTextNode("Question");
          const summary = $createDetailsSummaryNode().append(placeholder);
          const content = $createDetailsContentNode().append($createParagraphNode());
          const details = $createDetailsNode().append(summary, content);
          // Collapsibles can't nest (the first `:::` would close the outer one),
          // so inserting from inside one places the new block after it.
          const selection = $getSelection();
          const enclosing = $isRangeSelection(selection)
            ? $findMatchingParent(selection.anchor.getNode(), $isDetailsNode)
            : null;
          if (enclosing) enclosing.insertAfter(details);
          else $insertNodeToNearestRoot(details);
          if (!details.getNextSibling()) details.insertAfter($createParagraphNode());
          // Select the placeholder so typing replaces it
          placeholder.select(0, placeholder.getTextContentSize());
          return true;
        },
        COMMAND_PRIORITY_EDITOR
      ),

      // Enter on an empty last line of the answer leaves the block
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        (event) => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection) || !selection.isCollapsed()) return false;
          const block = $findMatchingParent(
            selection.anchor.getNode(),
            (node) => $isParagraphNode(node)
          );
          const content = block?.getParent();
          if (
            !$isParagraphNode(block) ||
            !block.isEmpty() ||
            !$isDetailsContentNode(content) ||
            block.getNextSibling() ||
            !block.getPreviousSibling()
          ) {
            return false;
          }
          event?.preventDefault();
          content.getParentOrThrow().insertAfter(block);
          block.select();
          return true;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor]);

  return null;
}
