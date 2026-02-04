import {ReactNodeViewRenderer} from '@tiptap/react'
import {
  FileUploadBase,
  type FileUploadOptions,
  type FileUploadStorage,
  type FileUploadTargetType
} from '../../../shared/tiptap/extensions/FileUploadBase'
import {FileUploadView} from './FileUploadView'
import {onUploadTipTapFile} from './onUploadTipTapFile'

export const FileUpload = FileUploadBase.extend<FileUploadOptions, FileUploadStorage>({
  addOptions() {
    return {
      assetScope: '' as any,
      scopeKey: '',
      atmosphere: undefined as any,
      commit: undefined as any,
      highestTier: undefined as any
    }
  },
  addStorage(this) {
    const {assetScope, scopeKey, atmosphere, commit, highestTier} = this.options
    const onUpload = onUploadTipTapFile(atmosphere, highestTier, commit)
    return {
      assetScope,
      scopeKey,
      onUpload
    }
  },

  addKeyboardShortcuts(this) {
    return {
      Enter: ({editor}) => {
        // the open state of the menu is kept in FileUploadView
        // and we can't communicate with that component via props or state
        // so we attach an event emitter on the editor, since that's shared
        if (editor.isActive('fileUpload')) {
          editor.emit('enter', {editor})
          return true
        }
        return false
      }
    }
  },
  addCommands() {
    return {
      setFileUpload:
        (targetType: FileUploadTargetType) =>
        ({commands}) => {
          // note: only call 1 command here. Calling multiple here & then having the caller also chaining commands
          // will result in a fatal "Applying a mismatched transaction"
          return commands.insertContent({
            type: 'fileUpload',
            attrs: {targetType}
          })
        },
      setFileBlock:
        (attrs) =>
        ({commands}) => {
          const {pos, ...rest} = attrs
          const node = {
            type: 'fileBlock',
            attrs: rest
          }
          if (pos) {
            return commands.insertContentAt(pos, node)
          }
          return commands.insertContent(node)
        }
    }
  },

  addNodeView() {
    // By convention, components rendered here are named with a *View suffix
    return ReactNodeViewRenderer(FileUploadView, {
      className: 'group'
    })
  }
})
