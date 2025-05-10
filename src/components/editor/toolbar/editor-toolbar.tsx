'use client'

// import { $createMathNode } from "./nodes/MathNode"
// import { useCallback, useState } from 'react'
// import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
// import {
//   $getSelection,
//   $isRangeSelection,
//   FORMAT_TEXT_COMMAND,
//   createCommand,
// } from 'lexical'
// import { $wrapNodes } from '@lexical/selection'
// import { $createHeadingNode } from '@lexical/rich-text'
// import { $createParagraphNode } from 'lexical'
// import { $createCodeNode } from '@lexical/code'
// import { $createQuoteNode } from '@lexical/rich-text'
// import {
//   INSERT_ORDERED_LIST_COMMAND,
//   INSERT_UNORDERED_LIST_COMMAND,
// } from '@lexical/list'
// import { Button } from '@/components/ui/button'
// import { Separator } from '@/components/ui/separator'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from '@/components/ui/dialog'
// import { Input } from '@/components/ui/input'
// import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
// import {
//   Bold,
//   Italic,
//   Underline,
//   Strikethrough,
//   Heading1,
//   Heading2,
//   List,
//   ListOrdered,
//   Code,
//   Quote,
//   Undo,
//   Redo,
//   Link,
//   ImageIcon,
//   ActivityIcon as Function,
// } from 'lucide-react'
// import { $createEquationNode } from '../nodes/equation-node'
// import { ErrorBoundary } from 'react-error-boundary'
// import KatexRenderer from '../ui/katex-renderer'

// export const INSERT_MATH_COMMAND = createCommand('INSERT_MATH_COMMAND')
// export const INSERT_IMAGE_COMMAND = createCommand('INSERT_IMAGE_COMMAND')

// export default function EditorToolbar() {
//   const [editor] = useLexicalComposerContext()
//   const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
//   const [linkUrl, setLinkUrl] = useState('')
//   const [linkText, setLinkText] = useState('')
//   const [isMathDialogOpen, setIsMathDialogOpen] = useState(false)
//   const [mathEquation, setMathEquation] = useState('')
//   const [isInline, setIsInline] = useState(false)
//   const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
//   const [imageUrl, setImageUrl] = useState('')
//   const [imageAlt, setImageAlt] = useState('')

//   const formatHeading = useCallback(
//     (headingSize: 'h1' | 'h2') => {
//       editor.update(() => {
//         const selection = $getSelection()
//         if ($isRangeSelection(selection)) {
//           $wrapNodes(selection, () => {
//             return headingSize === 'h1'
//               ? $createHeadingNode('h1')
//               : $createHeadingNode('h2')
//           })
//         }
//       })
//     },
//     [editor]
//   )

//   const formatParagraph = useCallback(() => {
//     editor.update(() => {
//       const selection = $getSelection()
//       if ($isRangeSelection(selection)) {
//         $wrapNodes(selection, () => $createParagraphNode())
//       }
//     })
//   }, [editor])

//   const formatCode = useCallback(() => {
//     editor.update(() => {
//       const selection = $getSelection()
//       if ($isRangeSelection(selection)) {
//         $wrapNodes(selection, () => $createCodeNode())
//       }
//     })
//   }, [editor])

//   const formatQuote = useCallback(() => {
//     editor.update(() => {
//       const selection = $getSelection()
//       if ($isRangeSelection(selection)) {
//         $wrapNodes(selection, () => $createQuoteNode())
//       }
//     })
//   }, [editor])

//   const insertLink = useCallback(() => {
//     if (linkUrl.trim() !== '') {
//       editor.dispatchCommand(INSERT_LINK_COMMAND, {
//         url: linkUrl,
//         text: linkText,
//       })
//       setLinkUrl('')
//       setLinkText('')
//       setIsLinkDialogOpen(false)
//     }
//   }, [editor, linkUrl, linkText])

//   const insertMath = useCallback(() => {
//     if (mathEquation.trim() !== '') {
//       editor.update(() => {
//         const node = $createEquationNode(mathEquation, isInline)
//         $insertNodeToNearestRoot(node)
//       })
//       setMathEquation('')
//       setIsInline(false)
//       setIsMathDialogOpen(false)
//     }
//   }, [editor, mathEquation, isInline])

//   const insertImage = useCallback(() => {
//     if (imageUrl.trim() !== '') {
//       editor.dispatchCommand(INSERT_IMAGE_COMMAND, {
//         src: imageUrl,
//         altText: imageAlt,
//       })
//       setImageUrl('')
//       setImageAlt('')
//       setIsImageDialogOpen(false)
//     }
//   }, [editor, imageUrl, imageAlt])

//   return (
//     <div className='border-b p-2 flex flex-wrap gap-1 items-center'>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
//         title='Bold'
//       >
//         <Bold className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
//         title='Italic'
//       >
//         <Italic className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
//         title='Underline'
//       >
//         <Underline className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() =>
//           editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
//         }
//         title='Strikethrough'
//       >
//         <Strikethrough className='h-4 w-4' />
//       </Button>

//       <Separator orientation='vertical' className='mx-1 h-6' />

//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => formatHeading('h1')}
//         title='Heading 1'
//       >
//         <Heading1 className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => formatHeading('h2')}
//         title='Heading 2'
//       >
//         <Heading2 className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={formatParagraph}
//         title='Paragraph'
//       >
//         <span className='text-sm font-bold'>P</span>
//       </Button>

//       <Separator orientation='vertical' className='mx-1 h-6' />

//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() =>
//           editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)
//         }
//         title='Bullet List'
//       >
//         <List className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() =>
//           editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)
//         }
//         title='Numbered List'
//       >
//         <ListOrdered className='h-4 w-4' />
//       </Button>

//       <Separator orientation='vertical' className='mx-1 h-6' />

//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={formatCode}
//         title='Code Block'
//       >
//         <Code className='h-4 w-4' />
//       </Button>
//       <Button variant='ghost' size='icon' onClick={formatQuote} title='Quote'>
//         <Quote className='h-4 w-4' />
//       </Button>

//       <Separator orientation='vertical' className='mx-1 h-6' />

//       <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
//         <DialogTrigger asChild>
//           <Button variant='ghost' size='icon' title='Insert Link'>
//             <Link className='h-4 w-4' />
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Insert Link</DialogTitle>
//           </DialogHeader>
//           <div className='grid gap-4 py-4'>
//             <div className='grid gap-2'>
//               <Label htmlFor='link-text'>Link Text</Label>
//               <Input
//                 id='link-text'
//                 value={linkText}
//                 onChange={(e) => setLinkText(e.target.value)}
//                 placeholder='Link text'
//               />
//             </div>
//             <div className='grid gap-2'>
//               <Label htmlFor='link-url'>URL</Label>
//               <Input
//                 id='link-url'
//                 value={linkUrl}
//                 onChange={(e) => setLinkUrl(e.target.value)}
//                 placeholder='https://example.com'
//               />
//             </div>
//           </div>
//           <div className='flex justify-end'>
//             <Button onClick={insertLink}>Insert</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
//         <DialogTrigger asChild>
//           <Button variant='ghost' size='icon' title='Insert Image'>
//             <ImageIcon className='h-4 w-4' />
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Insert Image</DialogTitle>
//           </DialogHeader>
//           <div className='grid gap-4 py-4'>
//             <div className='grid gap-2'>
//               <Label htmlFor='image-url'>Image URL</Label>
//               <Input
//                 id='image-url'
//                 value={imageUrl}
//                 onChange={(e) => setImageUrl(e.target.value)}
//                 placeholder='https://example.com/image.jpg'
//               />
//             </div>
//             <div className='grid gap-2'>
//               <Label htmlFor='image-alt'>Alt Text</Label>
//               <Input
//                 id='image-alt'
//                 value={imageAlt}
//                 onChange={(e) => setImageAlt(e.target.value)}
//                 placeholder='Image description'
//               />
//             </div>
//           </div>
//           <div className='flex justify-end'>
//             <Button onClick={insertImage}>Insert</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Dialog open={isMathDialogOpen} onOpenChange={setIsMathDialogOpen}>
//         <DialogTrigger asChild>
//           <Button variant='ghost' size='icon' title='Insert Math Equation'>
//             <Function className='h-4 w-4' />
//           </Button>
//         </DialogTrigger>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Insert Math Equation</DialogTitle>
//           </DialogHeader>
//           <div className='grid gap-4 py-4'>
//             <div className='grid gap-2'>
//               <Label htmlFor='math-equation'>Equation</Label>
//               <Textarea
//                 id='math-equation'
//                 value={mathEquation}
//                 onChange={(e) => setMathEquation(e.target.value)}
//                 placeholder=''
//                 rows={4}
//               />
//             </div>
//             {/* <div className='flex items-center space-x-2'>
//               <input
//                 type='checkbox'
//                 id='inline-math'
//                 checked={isInline}
//                 onChange={(e) => setIsInline(e.target.checked)}
//                 className='rounded border-gray-300'
//               />
//               <Label htmlFor='inline-math'>Inline Math ($...$)</Label>
//             </div> */}
//             {mathEquation && (
//               <div className='p-4 bg-gray-50 rounded-md'>
//                 <p className='text-sm font-medium mb-2'>Preview:</p>
//                 <ErrorBoundary
//                   onError={(e) => editor._onError(e)}
//                   fallback={null}
//                 >
//                   <KatexRenderer
//                     equation={mathEquation}
//                     inline={false}
//                     onDoubleClick={() => {}}
//                   />
//                 </ErrorBoundary>
//               </div>
//             )}
//           </div>
//           <div className='flex justify-end'>
//             <Button onClick={insertMath}>Insert</Button>
//           </div>
//         </DialogContent>
//       </Dialog>

//       <Separator orientation='vertical' className='mx-1 h-6' />

//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
//         title='Undo'
//       >
//         <Undo className='h-4 w-4' />
//       </Button>
//       <Button
//         variant='ghost'
//         size='icon'
//         onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
//         title='Redo'
//       >
//         <Redo className='h-4 w-4' />
//       </Button>
//     </div>
//   )
// }

// // These commands would be imported from lexical in a real implementation
// const UNDO_COMMAND = createCommand('UNDO_COMMAND')
// const REDO_COMMAND = createCommand('REDO_COMMAND')
// const INSERT_LINK_COMMAND = createCommand('INSERT_LINK_COMMAND')

// // Helper function to insert a node at the nearest root
// function $insertNodeToNearestRoot(node: any) {
//   const selection = $getSelection()
//   if ($isRangeSelection(selection)) {
//     const anchor = selection.anchor
//     const focus = selection.focus
//     const nodes = selection.getNodes()

//     if (nodes.length === 0) {
//       selection.insertNodes([node])
//     } else {
//       // Find the nearest common ancestor
//       const anchorNode = anchor.getNode()
//       anchorNode.insertAfter(node)
//     }
//   }
// }
