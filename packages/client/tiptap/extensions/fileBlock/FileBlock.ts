import {ReactNodeViewRenderer} from '@tiptap/react'
import {FileBlockBase} from '../../../shared/tiptap/extensions/FileBlockBase'
import {FileBlockView} from './FileBlockView'

export const FileBlock = FileBlockBase.extend({
  addKeyboardShortcuts(this) {
    return {
      Enter: ({editor}) => {
        if (editor.isActive('fileBlock')) {
          editor.emit('enter', {editor})
          return true
        }
        return false
      }
    }
  },
  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(FileBlockView, {
      className: 'group'
    })
  }
})

export default FileBlock
