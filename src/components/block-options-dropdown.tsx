import {
  ElementNode,
  LexicalEditor,
  $createParagraphNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { useEffect, useRef } from 'react'
import { $wrapNodes } from '@lexical/selection'
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
} from '@lexical/list'
import { $createHeadingNode, $createQuoteNode } from '@lexical/rich-text'
import { $createCodeNode } from '@lexical/code'

interface BlockOptionsDropdownListProps {
  editor: LexicalEditor
  blockType: string
  toolbarRef: React.RefObject<HTMLDivElement>
  setShowBlockOptionsDropDown: (show: boolean) => void
}

export function BlockOptionsDropdownList({
  editor,
  blockType,
  toolbarRef,
  setShowBlockOptionsDropDown,
}: BlockOptionsDropdownListProps) {
  const dropDownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const toolbar = toolbarRef.current
    const dropDown = dropDownRef.current
    if (toolbar && dropDown) {
      const { top, left } = toolbar.getBoundingClientRect()
      dropDown.style.top = `${top + 40}px`
      dropDown.style.left = `${left}px`
    }
  }, [toolbarRef])

  useEffect(() => {
    const dropDown = dropDownRef.current
    const toolbar = toolbarRef.current
    if (dropDown && toolbar) {
      const handleClick = (event: MouseEvent) => {
        if (
          !dropDown.contains(event.target as Node) &&
          !toolbar.contains(event.target as Node)
        ) {
          setShowBlockOptionsDropDown(false)
        }
      }
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [setShowBlockOptionsDropDown, toolbarRef])

  const formatBlock = (nodeCreator: () => ElementNode) => {
    editor.update(() => {
      const selection = $getSelection()
      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, nodeCreator)
      }
    })
    setShowBlockOptionsDropDown(false)
  }

  const formatList = (insertCommand: any, type: string) => {
    if (blockType !== type) {
      editor.dispatchCommand(insertCommand, undefined)
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)
    }
    setShowBlockOptionsDropDown(false)
  }

  return (
    <div className='dropdown' ref={dropDownRef}>
      <button
        className='item'
        onClick={() => formatBlock(() => $createParagraphNode())}
      >
        <span className='icon paragraph' />
        <span className='text'>Normal</span>
        {blockType === 'paragraph' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatBlock(() => $createHeadingNode('h1'))}
      >
        <span className='icon large-heading' />
        <span className='text'>Large Heading</span>
        {blockType === 'h1' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatBlock(() => $createHeadingNode('h2'))}
      >
        <span className='icon small-heading' />
        <span className='text'>Small Heading</span>
        {blockType === 'h2' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatList(INSERT_UNORDERED_LIST_COMMAND, 'ul')}
      >
        <span className='icon bullet-list' />
        <span className='text'>Bullet List</span>
        {blockType === 'ul' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatList(INSERT_ORDERED_LIST_COMMAND, 'ol')}
      >
        <span className='icon numbered-list' />
        <span className='text'>Numbered List</span>
        {blockType === 'ol' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatBlock(() => $createQuoteNode())}
      >
        <span className='icon quote' />
        <span className='text'>Quote</span>
        {blockType === 'quote' && <span className='active' />}
      </button>
      <button
        className='item'
        onClick={() => formatBlock(() => $createCodeNode())}
      >
        <span className='icon code' />
        <span className='text'>Code Block</span>
        {blockType === 'code' && <span className='active' />}
      </button>
    </div>
  )
}
