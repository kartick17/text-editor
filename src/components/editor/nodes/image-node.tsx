"use client"
import {
  DecoratorNode,
  type EditorConfig,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical"

export type SerializedImageNode = Spread<
  {
    src: string
    altText: string
    width?: number
    height?: number
  },
  SerializedLexicalNode
>

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string
  __altText: string
  __width: number | undefined
  __height: number | undefined

  static getType(): string {
    return "image"
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__width, node.__height, node.__key)
  }

  constructor(src: string, altText: string, width?: number, height?: number, key?: NodeKey) {
    super(key)
    this.__src = src
    this.__altText = altText
    this.__width = width
    this.__height = height
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const div = document.createElement("div")
    div.className = "image-container"
    return div
  }

  updateDOM(): false {
    return false
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const node = $createImageNode(
      serializedNode.src,
      serializedNode.altText,
      serializedNode.width,
      serializedNode.height,
    )
    return node
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      type: "image",
      version: 1,
    }
  }

  getSrc(): string {
    return this.__src
  }

  getAltText(): string {
    return this.__altText
  }

  setSrc(src: string): void {
    const writable = this.getWritable()
    writable.__src = src
  }

  setAltText(altText: string): void {
    const writable = this.getWritable()
    writable.__altText = altText
  }

  decorate(): JSX.Element {
    return (
      <ImageComponent
        src={this.__src || "/placeholder.svg"}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
      />
    )
  }
}

export function $createImageNode(src: string, altText: string, width?: number, height?: number): ImageNode {
  return new ImageNode(src, altText, width, height)
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode
}

function ImageComponent({
  src,
  altText,
  width,
  height,
}: {
  src: string
  altText: string
  width?: number
  height?: number
}) {
  return (
    <div className="relative my-4">
      <img
        src={src || "/placeholder.svg?height=300&width=400"}
        alt={altText || "Image"}
        width={width || 400}
        height={height || 300}
        className="max-w-full rounded-md"
        style={{ objectFit: "contain" }}
      />
    </div>
  )
}
