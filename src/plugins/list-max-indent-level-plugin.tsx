import { $getListDepth, $isListItemNode, $isListNode } from '@lexical/list'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  INDENT_CONTENT_COMMAND,
  COMMAND_PRIORITY_HIGH,
  type ElementNode,
  type RangeSelection,
} from 'lexical'
import { useEffect } from 'react'

function getElementNodesInSelection(
  selection: RangeSelection
): Set<ElementNode> {
  const nodesInSelection = selection.getNodes()

  if (nodesInSelection.length === 0) {
    return new Set<ElementNode>([
      selection.anchor.getNode().getParentOrThrow(),
      selection.focus.getNode().getParentOrThrow(),
    ])
  }

  return new Set<ElementNode>(
    nodesInSelection.map((n) => ($isElementNode(n) ? n : n.getParentOrThrow()))
  )
}

function isIndentPermitted(maxDepth: number): boolean {
  const selection = $getSelection()

  if (!$isRangeSelection(selection)) {
    return false
  }

  const elementNodesInSelection = getElementNodesInSelection(selection)

  let totalDepth = 0

  for (const elementNode of elementNodesInSelection) {
    if ($isListNode(elementNode)) {
      totalDepth = Math.max($getListDepth(elementNode) + 1, totalDepth)
    } else if ($isListItemNode(elementNode)) {
      const parent = elementNode.getParent()
      if (!$isListNode(parent)) {
        throw new Error(
          'ListMaxIndentLevelPlugin: A ListItemNode must have a ListNode for a parent.'
        )
      }

      totalDepth = Math.max($getListDepth(parent) + 1, totalDepth)
    }
  }

  return totalDepth <= maxDepth
}

interface ListMaxIndentLevelPluginProps {
  maxDepth?: number
}

export default function ListMaxIndentLevelPlugin({
  maxDepth = 7,
}: ListMaxIndentLevelPluginProps): null {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    return editor.registerCommand(
      INDENT_CONTENT_COMMAND,
      () => {
        return !isIndentPermitted(maxDepth)
      },
      COMMAND_PRIORITY_HIGH
    )
  }, [editor, maxDepth])

  return null
}
