import type {Editor} from '@tiptap/core'
import {filetypeextension} from 'magic-bytes.js'
import type {TierEnum} from '../../../__generated__/useTipTapPageEditor_viewer.graphql'
import type Atmosphere from '../../../Atmosphere'
import type {useUploadUserAsset} from '../../../mutations/useUploadUserAsset'
import type {FileUploadTargetType} from '../../../shared/tiptap/extensions/FileUploadBase'

export const onUploadTipTapFile =
  (
    atmosphere: Atmosphere,
    highestTier: TierEnum | null | undefined,
    commit: ReturnType<typeof useUploadUserAsset>[0]
  ) =>
  async (file: File, editor: Editor, targetType: FileUploadTargetType) => {
    if (!highestTier) return
    const isFree = highestTier === 'starter'
    const sizeLimit = isFree ? 8_000_000 : 64_000_000
    if (file.size > sizeLimit) {
      const prefix = `The file is too large.`
      const message = isFree
        ? `Please upgrade for larger file uploads.`
        : `Please reach out if you need to store files larger than 64MB.`
      atmosphere.eventEmitter.emit('addSnackbar', {
        key: 'fileTooBIG',
        message: `${prefix} ${message}`,
        autoDismiss: 5
      })
    }
    const bytes = new Uint8Array(await file.arrayBuffer())
    const foo = filetypeextension(bytes)
    console.log('DEBUG:', foo)
    const {scopeKey, assetScope} = editor.extensionStorage.fileUpload
    commit({
      variables: {scope: assetScope, scopeKey},
      uploadables: {file: file},
      onCompleted: (res) => {
        const {uploadUserAsset} = res
        const {url} = uploadUserAsset!
        const message = uploadUserAsset?.error?.message
        if (message) {
          atmosphere.eventEmitter.emit('addSnackbar', {
            key: 'errorUploadUserAsset',
            message,
            autoDismiss: 5
          })
          return
        }
        const src = url!
        const {commands} = editor
        if (targetType === 'file') {
          commands.setFileBlock({src, name: file.name, size: file.size})
        } else if (targetType === 'image') {
          commands.setImageBlock({src})
        } else {
          console.error('Unknown target type', targetType)
        }
      }
    })
  }
