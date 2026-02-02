import {Node} from '@tiptap/react'
export type FileBlockAttrs = {
  src: string
  name: string
  size: number
}

export const FileBlockBase = Node.create({
  name: 'fileBlock',

  isolating: true,

  defining: true,

  group: 'block',

  draggable: true,

  selectable: true,

  inline: false,
  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => ({
          src: attributes.src
        })
      },
      name: {
        default: '',
        parseHTML: (element) => element.getAttribute('data-name'),
        renderHTML: (attributes) => ({
          'data-name': attributes.name
        })
      },
      size: {
        default: 0,
        parseHTML: (element) => element.getAttribute('data-size'),
        renderHTML: (attributes) => ({
          'data-size': attributes.size
        })
      }
    }
  },

  parseHTML() {
    return [
      {
        tag: `div[data-type="${this.name}"]`
      }
    ]
  },

  renderHTML() {
    return ['div', {'data-type': this.name}]
  }
})
