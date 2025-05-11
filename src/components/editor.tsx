'use client'

import { useCallback, useEffect, type JSX } from 'react'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { type InitialConfigType } from '@lexical/react/LexicalComposer'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { TableCellNode, TableNode, TableRowNode } from '@lexical/table'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin'
import { TRANSFORMERS } from '@lexical/markdown'

import theme from '@/themes/themes'
import CodeHighlightPlugin from '@/plugins/code-highlight-plugin'
import ToolbarPlugin from '@/plugins/toolbar-plugin'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import ListMaxIndentLevelPlugin from '@/plugins/list-max-indent-level-plugin'
import { MATCHERS } from '@/plugins/auto-link-plugin'
import { EquationNode } from './editor/nodes/equation-node'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { EditorState } from 'lexical'
import { EditorProvider } from './editor/contexts/editor-context'

function Placeholder({ text }: { text?: string }): JSX.Element {
  return (
    <div className='editor-placeholder'>{text ?? 'Write something...'}</div>
  )
}

const editorConfig: InitialConfigType = {
  namespace: 'MyEditor', // Add this line with a unique string
  theme,
  onError(error: Error) {
    console.error('Lexical Error:', error)
    throw error
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    TableNode,
    TableCellNode,
    TableRowNode,
    AutoLinkNode,
    LinkNode,
    EquationNode,
  ],
}

interface EditorComponentProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  classes?: {
    root?: string
  }
}

const EditorComponent = (props: EditorComponentProps): JSX.Element => {
  const { classes, onChange, value, placeholder } = props

  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    try {
      const restored = editor.parseEditorState(value || '')
      editor.setEditorState(restored)
    } catch (e) {
      console.error('Error parsing editor state: ', e)
    }
  }, [editor, value])

  const handleChange = useCallback(
    (editorState: EditorState) => {
      const json = editorState.toJSON()
      onChange?.(JSON.stringify(json))
    },
    [onChange]
  )

  useEffect(() => {
    const unregister = editor.registerUpdateListener(({ editorState }) => {
      handleChange(editorState)
    })
    return () => unregister()
  }, [handleChange, editor])

  return (
    <div className={`${classes?.root} editor-container`}>
      <ToolbarPlugin />
      <div className='editor-inner'>
        <RichTextPlugin
          contentEditable={<ContentEditable className='editor-input' />}
          placeholder={<Placeholder text={placeholder} />}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <AutoFocusPlugin />
        <CodeHighlightPlugin />
        <ListPlugin />
        <LinkPlugin />
        <AutoLinkPlugin matchers={MATCHERS} />
        <ListMaxIndentLevelPlugin maxDepth={7} />
        <MarkdownShortcutPlugin transformers={TRANSFORMERS} />
      </div>
    </div>
  )
}

const Editor = (props: EditorComponentProps) => {
  return (
    <LexicalComposer initialConfig={editorConfig}>
      <EditorProvider>
        <EditorComponent {...props} />
      </EditorProvider>
    </LexicalComposer>
  )
}

export default Editor
