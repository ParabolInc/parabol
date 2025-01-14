import {Node, ReactNodeViewRenderer} from '@tiptap/react'
import {ImageUploadView} from './ImageUploadView'

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    imageUpload: {
      setImageUpload: () => ReturnType
    }
  }
}

export const ImageUpload = Node.create({
  name: 'imageUpload',

  isolating: true,

  defining: true,

  group: 'block',

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

  renderHTML() {
    return ['div', {'data-type': this.name}]
  },

  addCommands() {
    return {
      setImageUpload:
        () =>
        ({commands}) =>
          commands.insertContent(`<div data-type="${this.name}"></div>`)
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ImageUploadView)
  }
})

export default ImageUpload
