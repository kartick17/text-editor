import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import React, { createContext, useCallback, useContext, useState } from 'react'
import { $createEquationNode, $isEquationNode } from '../nodes/equation-node'
import { $insertNodeToNearestRoot } from '@lexical/utils'
import { $getNodeByKey } from 'lexical'

interface EditorContextType {
  isMathKeyboardOpen: boolean
  setIsMathKeyboardOpen: React.Dispatch<React.SetStateAction<boolean>>
  mathExpression: string
  setMathExpression: React.Dispatch<React.SetStateAction<string>>
  handleExpressionInsert: () => void
  editingMathNodeKey: string | null
  setEditingMathNodeKey: React.Dispatch<React.SetStateAction<string | null>>
}

const EditorContext = createContext<EditorContextType | undefined>(undefined)

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mathExpression, setMathExpression] = useState('')
  const [isMathKeyboardOpen, setIsMathKeyboardOpen] = useState(false)
  const [editingMathNodeKey, setEditingMathNodeKey] = useState<string | null>(
    null
  )

  const [editor] = useLexicalComposerContext()

  // const insertMath = useCallback(() => {
  //   if (mathExpression.trim() !== '') {
  //     editor.update(() => {
  //       const node = $createEquationNode(mathExpression)
  //       $insertNodeToNearestRoot(node)
  //     })
  //   }
  // }, [editor, mathExpression])

  const insertMath = useCallback(() => {
    if (mathExpression.trim() !== '') {
      editor.update(() => {
        if (editingMathNodeKey) {
          const node = $getNodeByKey(editingMathNodeKey)
          if ($isEquationNode(node)) {
            node.setEquation(mathExpression) // Update existing node
          }
        } else {
          const node = $createEquationNode(mathExpression)
          $insertNodeToNearestRoot(node)
        }
      })
    }
  }, [editor, mathExpression, editingMathNodeKey])

  const handleExpressionInsert = () => {
    insertMath()
    setMathExpression('')
    setEditingMathNodeKey(null)
    setIsMathKeyboardOpen(false)
  }

  return (
    <EditorContext.Provider
      value={{
        isMathKeyboardOpen,
        setIsMathKeyboardOpen,
        mathExpression,
        setMathExpression,
        handleExpressionInsert,
        editingMathNodeKey,
        setEditingMathNodeKey,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext)
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider')
  }
  return context
}
