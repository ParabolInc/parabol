import {Node} from '@tiptap/react'

export const ThinkingBlockBase = Node.create({
  name: 'thinkingBlock',

  isolating: true,

  defining: true,

  group: 'block',
  inline: false,
  atom: true,

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },
  renderHTML() {
    return ['div', {'data-type': this.name}]
  },
  renderText() {
    return ''
  }
})
