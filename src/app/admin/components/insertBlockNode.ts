import { $isParagraphNode, type LexicalNode } from "lexical";
import { $insertNodeToNearestRoot } from "@lexical/utils";

// $insertNodeToNearestRoot splits the paragraph at the caret, which leaves an empty
// paragraph before the block (caret at line start) or after it (caret at line end).
// Drop those unless they're the only place left to type above or below the block.
export function $insertBlockNode<T extends LexicalNode>(node: T): T {
  const inserted = $insertNodeToNearestRoot(node);

  const previous = inserted.getPreviousSibling();
  if ($isParagraphNode(previous) && previous.isEmpty() && previous.getPreviousSibling()) {
    previous.remove();
  }

  const next = inserted.getNextSibling();
  if ($isParagraphNode(next) && next.isEmpty() && next.getNextSibling()) {
    next.remove();
    inserted.selectNext(0, 0);
  }

  return inserted;
}
