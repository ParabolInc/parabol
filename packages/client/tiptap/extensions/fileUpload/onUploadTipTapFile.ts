import type {Editor} from '@tiptap/core'
import {filetypeinfo} from 'magic-bytes.js'
import type {TierEnum} from '../../../__generated__/useTipTapPageEditor_viewer.graphql'
import type Atmosphere from '../../../Atmosphere'
import type {useUploadUserAsset} from '../../../mutations/useUploadUserAsset'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'
import {MAX_FILE_SIZE_FREE, MAX_FILE_SIZE_PAID, MAX_IMAGE_SIZE} from '../../../utils/constants'
import jpgWithoutEXIF from '../../../utils/jpgWithoutEXIF'

export const onUploadTipTapFile =
  (
    atmosphere: Atmosphere,
    highestTier: TierEnum | null | undefined,
    commit: ReturnType<typeof useUploadUserAsset>[0]
  ) =>
  async (file: File, editor: Editor, targetType: FileUploadTargetType, pos?: number) => {
    if (!highestTier) return
    const isFree = highestTier === 'starter'
    const sizeLimit =
      targetType === 'image' ? MAX_IMAGE_SIZE : isFree ? MAX_FILE_SIZE_FREE : MAX_FILE_SIZE_PAID
    if (file.size > sizeLimit) {
      const prefix = `The file is too large.`
      const message = isFree
        ? `Please upgrade for larger file uploads.`
        : `Please reach out if you need to store files larger than ${MAX_FILE_SIZE_PAID / 1_000_000}MB.`
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'fileTooBIG',
        message: `${prefix} ${message}`,
        autoDismiss: 5
      })
      return
    }
    if (file.type === 'image/jpeg') {
      file = (await jpgWithoutEXIF(file)) as File
    }
    const bytes = await file.bytes()
    const info = filetypeinfo(bytes)
    if (file.type !== '') {
      if (info.length > 0) {
        const contentIsCorrectType = info.some((i) => i.mime === file.type)
        if (!contentIsCorrectType) {
          const assumedType = info[0]?.typename ?? 'Unknown'
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'fileNotImage',
            message: `Expected ${file.type} but received ${assumedType}. Is the file extension correct?`,
            autoDismiss: 5
          })
          return
        }
      }
    }
    const fileType = file.type ?? info[0]?.mime ?? ''
    const nodeType = targetType === 'file' ? 'fileBlock' : 'imageBlock'
    const localSrc = URL.createObjectURL(file)
    const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
    if (targetType === 'file') {
      editor.commands.setFileBlock({src: localSrc, name: file.name, size: file.size, fileType, pos})
    } else if (targetType === 'image') {
      editor.commands.setImageBlock({src: localSrc, pos})
    } else {
      console.error('Unknown target type', targetType)
    }
    commit({
      variables: {scope: assetScope, scopeKey},
      uploadables: {file: file},
      onCompleted: (res, errors) => {
        const {uploadUserAsset} = res
        const message = uploadUserAsset?.error?.message ?? errors?.[0]?.message
        const {state, view} = editor
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorUploadUserAsset',
            message,
            autoDismiss: 5
          })
          state.doc.descendants((node, pos) => {
            if (node.type.name === nodeType && node.attrs.src === localSrc) {
              const tr = state.tr.deleteRange(pos, pos + node.nodeSize)
              view.dispatch(tr)
              return false
            }
            return true
          })
          return
        }
        const src = uploadUserAsset!.url!

        state.doc.descendants((node, pos) => {
          if (node.type.name === nodeType && node.attrs.src === localSrc) {
            const tr = state.tr.setNodeAttribute(pos, 'src', src)
            view.dispatch(tr)
            return false
          }
          return true
        })
      }
    })
  }
