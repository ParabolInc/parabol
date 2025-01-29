import {mergeAttributes, Range} from '@tiptap/core'
import {Image} from '@tiptap/extension-image'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageBlock: {
      setImageBlock: (attributes: {src: string}) => ReturnType
      setImageBlockAt: (attributes: {src: string; pos: number | Range}) => ReturnType
      setImageBlockAlign: (align: 'left' | 'center' | 'right') => ReturnType
      setImageBlockWidth: (width: number) => ReturnType
    }
  }
}

export const ImageBlockBase = Image.extend({
  name: 'imageBlock',

  group: 'block',

  defining: true,

  isolating: true,

  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])'
      }
    ]
  },

  renderHTML({HTMLAttributes}) {
    const align = HTMLAttributes['data-align']
    const justify = align === 'left' ? 'start' : align === 'right' ? 'end' : 'center'
    return [
      'div',
      {style: `width: 100%; display: flex; justify-content: ${justify};`},
      ['img', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)]
    ]
  }
})
