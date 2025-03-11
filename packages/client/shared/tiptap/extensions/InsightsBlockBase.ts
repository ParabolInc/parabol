import {mergeAttributes, Node} from '@tiptap/react'

export const InsightsBlockBase = Node.create({
  name: 'insightsBlock',

  isolating: true,

  defining: true,

  group: 'block',

  content: 'block*',

  draggable: true,

  selectable: true,

  inline: false,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML({HTMLAttributes}) {
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name}), 0]
  }
})
