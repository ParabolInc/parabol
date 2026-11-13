import {Node} from '@tiptap/core'

export const CalloutTitleBase = Node.create({
  name: 'calloutTitle',

  content: 'inline*',

  defining: true,

  parseHTML() {
    return [{tag: 'div[data-type="calloutTitle"]'}]
  },

  renderHTML({HTMLAttributes}) {
    return ['div', {...HTMLAttributes, 'data-type': 'calloutTitle'}, 0]
  }
})
