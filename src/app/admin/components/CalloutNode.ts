import {
  ElementNode,
  type EditorConfig,
  type LexicalNode,
  type SerializedElementNode,
  $createParagraphNode,
  type RangeSelection,
} from "lexical";

export class CalloutNode extends ElementNode {
  static getType(): string {
    return "callout";
  }

  static clone(node: CalloutNode): CalloutNode {
    return new CalloutNode(node.__key);
  }

  createDOM(config: EditorConfig): HTMLElement {
    const div = document.createElement("div");
    const theme = config.theme as { callout?: string };
    if (theme.callout) div.className = theme.callout;
    return div;
  }

  updateDOM(): false {
    return false;
  }

  static importJSON(): CalloutNode {
    return $createCalloutNode();
  }

  exportJSON(): SerializedElementNode {
    return { ...super.exportJSON(), type: "callout", version: 1 };
  }

  insertNewAfter(_: RangeSelection, restoreSelection?: boolean): LexicalNode {
    const newBlock = $createParagraphNode();
    const direction = this.getDirection();
    newBlock.setDirection(direction);
    this.insertAfter(newBlock, restoreSelection);
    return newBlock;
  }

  collapseAtStart(): true {
    const paragraph = $createParagraphNode();
    this.getChildren().forEach((child) => paragraph.append(child));
    this.replace(paragraph);
    return true;
  }
}

export function $createCalloutNode(): CalloutNode {
  return new CalloutNode();
}

export function $isCalloutNode(
  node: LexicalNode | null | undefined
): node is CalloutNode {
  return node instanceof CalloutNode;
}
