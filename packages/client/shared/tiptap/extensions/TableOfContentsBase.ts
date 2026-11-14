import {mergeAttributes, Node} from '@tiptap/core'

export const TableOfContentsBase = Node.create({
  name: 'tableOfContents',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,
  parseHTML() {
    return [{tag: `div[data-type="${this.name}"]`}]
  },
  renderHTML({HTMLAttributes}) {
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name})]
  },
  renderText() {
    return ''
  },
  renderMarkdown() {
    return ''
  }
})
