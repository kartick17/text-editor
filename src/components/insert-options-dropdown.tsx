// components/InsertOptionsDropdownList.tsx
'use client'

import { useEffect, useRef } from 'react'
import { LexicalEditor } from 'lexical'

interface InsertOptionsDropdownListProps {
  editor: LexicalEditor
  toolbarRef: React.RefObject<HTMLDivElement>
  setShowInsertOptionsDropdown: (show: boolean) => void
}

export function InsertOptionsDropdownList({
  editor,
  toolbarRef,
  setShowInsertOptionsDropdown,
}: InsertOptionsDropdownListProps) {
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
          setShowInsertOptionsDropdown(false)
        }
      }
      document.addEventListener('click', handleClick)
      return () => {
        document.removeEventListener('click', handleClick)
      }
    }
  }, [setShowInsertOptionsDropdown, toolbarRef])

  const insertEquation = () => {
    // Custom logic to insert an equation node
    editor.dispatchCommand('INSERT_EQUATION_COMMAND', undefined)
    setShowInsertOptionsDropdown(false)
  }

  const insertImage = () => {
    // Example: Open a dialog or insert a sample image
    editor.dispatchCommand('INSERT_IMAGE_COMMAND', {
      src: 'https://placehold.co/600x400',
      altText: 'Placeholder image',
    })
    setShowInsertOptionsDropdown(false)
  }

  const insertTable = () => {
    editor.dispatchCommand('INSERT_TABLE_COMMAND', {
      rows: 3,
      columns: 3,
    })
    setShowInsertOptionsDropdown(false)
  }

  return (
    <div className='dropdown' ref={dropDownRef}>
      <button className='item' onClick={insertEquation}>
        <span className='icon equation' />
        <span className='text'>Equation</span>
      </button>
      <button className='item' onClick={insertImage}>
        <span className='icon image' />
        <span className='text'>Image</span>
      </button>
      <button className='item' onClick={insertTable}>
        <span className='icon table' />
        <span className='text'>Table</span>
      </button>
    </div>
  )
}
