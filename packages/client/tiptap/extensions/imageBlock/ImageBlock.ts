import {ReactNodeViewRenderer} from '@tiptap/react'
import {ImageBlockBase} from './ImageBlockBase'
import {ImageBlockView} from './ImageBlockView'

export const ImageBlock = ImageBlockBase.extend({
  addAttributes() {
    return {
      src: {
        default: '',
        parseHTML: (element) => element.getAttribute('src'),
        renderHTML: (attributes) => ({
          src: attributes.src
        })
      },
      height: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('height'),
        renderHTML: (attributes) => ({
          height: attributes.height
        })
      },
      width: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('width'),
        renderHTML: (attributes) => ({
          width: attributes.width
        })
      },
      align: {
        default: 'center',
        parseHTML: (element) => element.getAttribute('data-align'),
        renderHTML: (attributes) => ({
          'data-align': attributes.align
        })
      },
      alt: {
        default: undefined,
        parseHTML: (element) => element.getAttribute('alt'),
        renderHTML: (attributes) => ({
          alt: attributes.alt
        })
      },
      isFullWidth: {
        default: false,
        parseHTML: (element) => element.getAttribute('data-full-width') === 'true',
        renderHTML: (attributes) => {
          if (!attributes.isFullWidth) {
            return {}
          }
          return {
            'data-full-width': attributes.isFullWidth
          }
        }
      }
    }
  },
  addCommands() {
    return {
      setImageBlock:
        (attrs) =>
        ({commands}) => {
          return commands.insertContent({
            type: 'imageBlock',
            attrs: {src: attrs.src}
          })
        },

      setImageBlockAt:
        (attrs) =>
        ({commands}) => {
          return commands.insertContentAt(attrs.pos, {
            type: 'imageBlock',
            attrs: {src: attrs.src}
          })
        },

      setImageBlockAlign:
        (align) =>
        ({commands}) =>
          commands.updateAttributes('imageBlock', {align}),

      setImageBlockWidth:
        (width: number) =>
        ({commands}: {commands: any}) =>
          commands.updateAttributes('imageBlock', {width, isFullWidth: false}),

      setImageBlockFullWidth:
        (isFullWidth: boolean) =>
        ({commands}: {commands: any}) =>
          commands.updateAttributes('imageBlock', {isFullWidth})
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ImageBlockView)
  }
})

export default ImageBlock
