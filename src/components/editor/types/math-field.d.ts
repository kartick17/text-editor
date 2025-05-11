declare namespace JSX {
  interface IntrinsicElements {
    'math-field': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      value?: string
      'virtual-keyboard'?: string
    }
  }
}
