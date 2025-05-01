export const supportedBlockTypes = new Set([
  'paragraph',
  'quote',
  'code',
  'h1',
  'h2',
  'ul',
  'ol',
])

export const blockTypeToBlockName: Record<string, string> = {
  code: 'Code Block',
  h1: 'Large Heading',
  h2: 'Small Heading',
  h3: 'Heading',
  h4: 'Heading',
  h5: 'Heading',
  ol: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
  ul: 'Bulleted List',
}
