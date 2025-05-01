export const supportedInsertTypes = new Set(['equation', 'image', 'table'])

export const insertTypeToInsertName: Record<string, string> = {
  equation: 'Equation',
  image: 'Image',
  table: 'Table',
}
