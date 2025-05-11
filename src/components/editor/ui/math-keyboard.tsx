import React from 'react'
import { useEditor } from '../contexts/editor-context'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { DialogHeader } from '@/components/ui/dialog'
import { Radical } from 'lucide-react'
import 'mathlive'

const MathKeyboard = () => {
  const mathFieldRef = React.useRef(null)

  const {
    isMathKeyboardOpen,
    setIsMathKeyboardOpen,
    handleExpressionInsert,
    mathExpression,
    setMathExpression,
  } = useEditor()

  return (
    <Dialog open={isMathKeyboardOpen} onOpenChange={setIsMathKeyboardOpen}>
      <DialogTrigger asChild>
        <Button variant='ghost' size='icon' title='Insert Math Equation'>
          <Radical className='h-4 w-4' />
        </Button>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Insert Math Equation</DialogTitle>
        </DialogHeader>

        {/* @ts-ignore */}
        <math-field
          ref={mathFieldRef}
          style={{ width: '100%' }}
          value={mathExpression}
          onInput={(e: any) => setMathExpression(e.target.value)}
          virtual-keyboard='manual'
          class='border border-gray-300 rounded p-2 w-full'
        />
        <div className='flex justify-end'>
          <Button onClick={handleExpressionInsert}>Insert</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default MathKeyboard
