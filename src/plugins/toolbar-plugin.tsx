'use client'

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $getNodeByKey,
  COMMAND_PRIORITY_LOW,
  LexicalEditor,
  RangeSelection,
  LexicalNode,
} from 'lexical'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { $isParentElementRTL, $isAtNodeEnd } from '@lexical/selection'
import {
  $getNearestNodeOfType,
  $insertNodeToNearestRoot,
  mergeRegister,
} from '@lexical/utils'
import { $isListNode, ListNode } from '@lexical/list'
import { createPortal } from 'react-dom'
import { $isHeadingNode } from '@lexical/rich-text'
import {
  $isCodeNode,
  getDefaultCodeLanguage,
  getCodeLanguages,
} from '@lexical/code'
import { BlockOptionsDropdownList } from '@/components/block-options-dropdown'
import {
  blockTypeToBlockName,
  supportedBlockTypes,
} from '@/constants/blockOptions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { $createEquationNode } from '@/components/editor/nodes/equation-node'
import { ActivityIcon as Function } from 'lucide-react'
import KatexRenderer from '@/components/editor/ui/katex-renderer'
import { ErrorBoundary } from 'react-error-boundary'
import { Label } from '@radix-ui/react-label'
import { Textarea } from '@/components/ui/textarea'
// import { supportedInsertTypes } from '@/constants/insertOptions'
// import { InsertOptionsDropdownList } from '@/components/insert-options-dropdown'

function Divider() {
  return <div className='divider' />
}

function positionEditorElement(editor: HTMLElement, rect: DOMRect | null) {
  if (rect === null) {
    editor.style.opacity = '0'
    editor.style.top = '-1000px'
    editor.style.left = '-1000px'
  } else {
    editor.style.opacity = '1'
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`
  }
}

function getSelectedNode(selection: RangeSelection): LexicalNode {
  const anchor = selection.anchor
  const focus = selection.focus
  const anchorNode = anchor.getNode()
  const focusNode = focus.getNode()
  if (anchorNode === focusNode) {
    return anchorNode
  }
  const isBackward = selection.isBackward()
  return isBackward
    ? $isAtNodeEnd(focus)
      ? anchorNode
      : focusNode
    : $isAtNodeEnd(anchor)
    ? focusNode
    : anchorNode
}

interface FloatingLinkEditorProps {
  editor: LexicalEditor
}

function FloatingLinkEditor({ editor }: FloatingLinkEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const mouseDownRef = useRef<boolean>(false)
  const [linkUrl, setLinkUrl] = useState<string>('')
  const [isEditMode, setEditMode] = useState<boolean>(false)
  const [lastSelection, setLastSelection] = useState<RangeSelection | null>(
    null
  )

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection()
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection)
      const parent = node.getParent()
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL())
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL())
      } else {
        setLinkUrl('')
      }
    }
    const editorElem = editorRef.current
    const nativeSelection = window.getSelection()
    const activeElement = document.activeElement

    if (editorElem === null) return

    const rootElement = editor.getRootElement()
    if (
      selection !== null &&
      nativeSelection &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0)
      let rect: DOMRect
      if (nativeSelection.anchorNode === rootElement) {
        let inner = rootElement as HTMLElement
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement
        }
        rect = inner.getBoundingClientRect()
      } else {
        rect = domRange.getBoundingClientRect()
      }
      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect)
      }
      setLastSelection(selection as RangeSelection | null)
    } else if (
      !activeElement ||
      (activeElement as HTMLElement).className !== 'link-input'
    ) {
      positionEditorElement(editorElem, null)
      setLastSelection(null)
      setEditMode(false)
      setLinkUrl('')
    }
    return true
  }, [editor])

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor()
          return true
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateLinkEditor])

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor()
    })
  }, [editor, updateLinkEditor])

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isEditMode])

  return (
    <div ref={editorRef} className='link-editor'>
      {isEditMode ? (
        <input
          ref={inputRef}
          className='link-input'
          value={linkUrl}
          onChange={(event) => setLinkUrl(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              if (lastSelection !== null && linkUrl !== '') {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl)
                setEditMode(false)
              }
            } else if (event.key === 'Escape') {
              event.preventDefault()
              setEditMode(false)
            }
          }}
        />
      ) : (
        <div className='link-input'>
          <a href={linkUrl} target='_blank' rel='noopener noreferrer'>
            {linkUrl}
          </a>
          <div
            className='link-edit'
            role='button'
            tabIndex={0}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => setEditMode(true)}
          />
        </div>
      )}
    </div>
  )
}

interface SelectProps {
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  className?: string
  options: string[]
  value: string
}

function Select({ onChange, className, options, value }: SelectProps) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden value='' />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  )
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext()
  const toolbarRef = useRef<HTMLDivElement>(null)

  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)
  const [blockType, setBlockType] = useState<string>('paragraph')
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(
    null
  )
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] =
    useState(false)
  // const [showInsertOptionsDropdown, setShowInsertOptionsDropdown] =
  //   useState(false)
  const [codeLanguage, setCodeLanguage] = useState<string>('')
  const [isRTL, setIsRTL] = useState(false)
  const [isLink, setIsLink] = useState(false)
  const [isBold, setIsBold] = useState(false)
  const [isEquation, setIsEquation] = useState('')
  const [isItalic, setIsItalic] = useState(false)
  const [isUnderline, setIsUnderline] = useState(false)
  const [isStrikethrough, setIsStrikethrough] = useState(false)
  const [isMathDialogOpen, setIsMathDialogOpen] = useState(false)
  const [isCode, setIsCode] = useState(false)

  const mergeRegistrations = (...registrations: (() => void)[]) => {
    return () => {
      registrations.forEach((registration) => registration())
    }
  }

  const updateToolbar = useCallback(() => {
    const selection = $getSelection()

    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode()
      const element =
        anchorNode.getKey() === 'root'
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow()

      const elementKey = element.getKey()
      const elementDOM = editor.getElementByKey(elementKey)

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey)

        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode)
          const type = parentList ? parentList.getTag() : element.getTag()
          setBlockType(type)
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType()
          setBlockType(type)

          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage())
          }
        }
      }

      setIsBold(selection.hasFormat('bold'))
      setIsItalic(selection.hasFormat('italic'))
      setIsUnderline(selection.hasFormat('underline'))
      setIsStrikethrough(selection.hasFormat('strikethrough'))
      setIsCode(selection.hasFormat('code'))
      setIsRTL($isParentElementRTL(selection))

      const node = getSelectedNode(selection)
      const parent = node.getParent()
      setIsLink($isLinkNode(parent) || $isLinkNode(node))
    }
  }, [editor])

  useEffect(() => {
    return mergeRegistrations(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar()
        })
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar()
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload: boolean) => {
          setCanUndo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload: boolean) => {
          setCanRedo(payload)
          return false
        },
        COMMAND_PRIORITY_LOW
      )
    )
  }, [editor, updateToolbar])

  const codeLanguages = useMemo(() => getCodeLanguages(), [])

  const onCodeLanguageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey)
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value)
          }
        }
      })
    },
    [editor, selectedElementKey]
  )

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, 'https://')
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
    }
  }, [editor, isLink])

  const insertMath = useCallback(() => {
    if (isEquation.trim() !== '') {
      editor.update(() => {
        const node = $createEquationNode(isEquation)
        $insertNodeToNearestRoot(node)
      })
      setIsEquation('')
      setIsMathDialogOpen(false)
    }
  }, [editor, isEquation])

  return (
    <div className='toolbar' ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        className='toolbar-item spaced'
        aria-label='Undo'
      >
        <i className='format undo' />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        className='toolbar-item'
        aria-label='Redo'
      >
        <i className='format redo' />
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          <button
            className='toolbar-item block-controls'
            onClick={() => setShowBlockOptionsDropDown((prev) => !prev)}
            aria-label='Formatting Options'
          >
            <span className={`icon block-type ${blockType}`} />
            <span className='text'>{blockTypeToBlockName[blockType]}</span>
            <i className='chevron-down' />
          </button>

          {showBlockOptionsDropDown &&
            toolbarRef.current &&
            createPortal(
              <BlockOptionsDropdownList
                editor={editor}
                blockType={blockType}
                toolbarRef={toolbarRef as React.RefObject<HTMLDivElement>}
                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
              />,
              document.body
            )}
        </>
      )}
      <Divider />

      {blockType === 'code' ? (
        <>
          <Select
            className='toolbar-item code-language'
            onChange={onCodeLanguageSelect}
            options={codeLanguages}
            value={codeLanguage}
          />
          <i className='chevron-down inside' />
        </>
      ) : (
        <>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            className={`toolbar-item spaced ${isBold ? 'active' : ''}`}
            aria-label='Format Bold'
          >
            <i className='format bold' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
            }
            className={`toolbar-item spaced ${isItalic ? 'active' : ''}`}
            aria-label='Format Italic'
          >
            <i className='format italic' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
            }
            className={`toolbar-item spaced ${isUnderline ? 'active' : ''}`}
            aria-label='Format Underline'
          >
            <i className='format underline' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
            }
            className={`toolbar-item spaced ${isStrikethrough ? 'active' : ''}`}
            aria-label='Format Strikethrough'
          >
            <i className='format strikethrough' />
          </button>
          <button
            onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code')}
            className={`toolbar-item spaced ${isCode ? 'active' : ''}`}
            aria-label='Insert Code'
          >
            <i className='format code' />
          </button>
          <button
            onClick={insertLink}
            className={`toolbar-item spaced ${isLink ? 'active' : ''}`}
            aria-label='Insert Link'
          >
            <i className='format link' />
          </button>
          {isLink &&
            createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
          <Divider />

          <Dialog open={isMathDialogOpen} onOpenChange={setIsMathDialogOpen}>
            <DialogTrigger asChild>
              <Button variant='ghost' size='icon' title='Insert Math Equation'>
                <Function className='h-4 w-4' />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Insert Math Equation</DialogTitle>
              </DialogHeader>
              <div className='grid gap-4 py-4'>
                <div className='grid gap-2'>
                  <Label htmlFor='math-equation'>Equation</Label>
                  <Textarea
                    id='math-equation'
                    value={isEquation}
                    onChange={(e) => setIsEquation(e.target.value)}
                    placeholder=''
                    rows={4}
                  />
                </div>
                {isEquation && (
                  <div className='p-4 bg-gray-50 rounded-md'>
                    <p className='text-sm font-medium mb-2'>Preview:</p>
                    <ErrorBoundary
                      onError={(e) => editor._onError(e)}
                      fallback={null}
                    >
                      <KatexRenderer
                        equation={isEquation}
                        inline={false}
                        onDoubleClick={() => {}}
                      />
                    </ErrorBoundary>
                  </div>
                )}
              </div>
              <div className='flex justify-end'>
                <Button onClick={insertMath}>Insert</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Divider />
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
            }
            className='toolbar-item spaced'
            aria-label='Left Align'
          >
            <i className='format left-align' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
            }
            className='toolbar-item spaced'
            aria-label='Center Align'
          >
            <i className='format center-align' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
            }
            className='toolbar-item spaced'
            aria-label='Right Align'
          >
            <i className='format right-align' />
          </button>
          <button
            onClick={() =>
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
            }
            className='toolbar-item'
            aria-label='Justify Align'
          >
            <i className='format justify-align' />
          </button>
        </>
      )}
    </div>
  )
}
