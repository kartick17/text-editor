'use client'

import type { JSX } from 'react'
import { useEffect, useMemo } from 'react'
import { TreeView } from '@lexical/react/LexicalTreeView'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext()

  // 1) Debounce helper
  const debounce = useMemo(() => {
    return <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
      let timer: ReturnType<typeof setTimeout>
      return ((...args: any[]) => {
        clearTimeout(timer)
        timer = setTimeout(() => fn(...args), delay)
      }) as T
    }
  }, [])

  // 2) Debounced save function
  const saveToStorage = useMemo(
    () =>
      debounce((json: any) => {
        localStorage.setItem('lexical-editor-state', JSON.stringify(json))
      }, 500),
    [debounce]
  )

  // 3) Listen for every editor update, serialize, and debounce the write
  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      const json = editorState.toJSON()
      saveToStorage(json)
    })
    return () => unregister()
  }, [editor, saveToStorage]) // :contentReference[oaicite:0]{index=0}

  // 4) On initial mount, restore any saved state
  useEffect(() => {
    const saved = localStorage.getItem('lexical-editor-state')
    console.log('saved', saved)
    if (saved) {
      try {
        // parseEditorState takes the stringified JSON and returns an EditorState
        const restored = editor.parseEditorState(saved)
        editor.setEditorState(restored)
      } catch (e) {
        console.error('Could not restore Lexical state:', e)
      }
    }
  }, [editor]) // :contentReference[oaicite:1]{index=1}

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
