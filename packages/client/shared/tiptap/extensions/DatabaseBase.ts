import {Node} from '@tiptap/core'

export const DatabaseBase = Node.create({
  name: 'database',
  renderHTML() {
    return ['div']
  },
  parseHTML() {
    return [{tag: 'database'}]
  }
})
