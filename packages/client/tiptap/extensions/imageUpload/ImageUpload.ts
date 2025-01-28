import {ReactNodeViewRenderer} from '@tiptap/react'
import {EventEmitter} from 'eventemitter3'
import {ImageUploadBase} from '../../../shared/tiptap/extensions/ImageUploadBase'
import {ImageUploadView} from './ImageUploadView'

export const ImageUpload = ImageUploadBase.extend<{editorWidth: number}>({
  addOptions() {
    return {
      editorWidth: 300
    }
  },
  addStorage(this) {
    return {
      emitter: new EventEmitter(),
      editorWidth: this.options.editorWidth
    }
  },

  addKeyboardShortcuts(this) {
    return {
      Enter: ({editor}) => {
        // the open state of the menu is kept in ImageUploadView
        // and we can't communicate with that component via props or state
        // so we attach an event emitter on the editor, since that's shared
        if (editor.isActive('imageUpload')) {
          this.storage.emitter.emit('enter')
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
