'use client'

import type { JSX } from 'react'
import { TreeView } from '@lexical/react/LexicalTreeView'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()

  return (
    <TreeView
      viewClassName='tree-view-output'
      timeTravelPanelClassName='debug-timetravel-panel'
      timeTravelButtonClassName='debug-timetravel-button'
      timeTravelPanelSliderClassName='debug-timetravel-panel-slider'
      timeTravelPanelButtonClassName='debug-timetravel-panel-button'
      editor={editor}
    />
  )
}
