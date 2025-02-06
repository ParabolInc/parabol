import {ReactNodeViewRenderer, type Editor} from '@tiptap/react'
import {ImageUploadBase} from '../../../shared/tiptap/extensions/ImageUploadBase'
import {ImageUploadView} from './ImageUploadView'

declare module '@tiptap/core' {
  interface EditorEvents {
    enter: {editor: Editor}
  }
}

export const ImageUpload = ImageUploadBase.extend<{editorWidth: number; editorHeight: number}>({
  addOptions() {
    return {
      editorWidth: 300,
      editorHeight: 112
    }
  },
  addStorage(this) {
    return {
      editorWidth: this.options.editorWidth,
      editorHeight: this.options.editorHeight
    }
  },

  addKeyboardShortcuts(this) {
    return {
      Enter: ({editor}) => {
        // the open state of the menu is kept in ImageUploadView
        // and we can't communicate with that component via props or state
        // so we attach an event emitter on the editor, since that's shared
        if (editor.isActive('imageUpload')) {
          editor.emit('enter', {editor})
          return true
        }
        return false
      }
    }
  },
  addCommands() {
    return {
      setImageUpload:
        () =>
        ({commands}) => {
          // note: only call 1 command here. Calling multiple here & then having the caller also chaining commands
          // will result in a fatal "Applying a mismatched transaction"
          return commands.insertContent(`<div data-type="${this.name}"></div>`)
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(ImageUploadView)
  }
})
