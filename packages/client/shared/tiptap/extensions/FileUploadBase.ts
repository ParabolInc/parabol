import {mergeAttributes, Editor as TipTapEditor} from '@tiptap/core'
import {Node} from '@tiptap/react'
import type {TierEnum} from '../../../__generated__/useTipTapPageEditor_viewer.graphql'
import type {AssetScopeEnum} from '../../../__generated__/useUploadUserAssetMutation.graphql'
import type Atmosphere from '../../../Atmosphere'
import type {useUploadUserAsset} from '../../../mutations/useUploadUserAsset'
import type {onUploadTipTapFile} from '../../../tiptap/extensions/fileUpload/onUploadTipTapFile'
import type {FileBlockAttrs} from './FileBlockBase'
export type FileUploadTargetType = 'file' | 'image'
export type FileUploadAttrs = {
  targetType: FileUploadTargetType
}

export interface FileUploadOptions {
  assetScope: AssetScopeEnum
  scopeKey: string
  atmosphere: Atmosphere
  commit: ReturnType<typeof useUploadUserAsset>[0]
  highestTier: TierEnum
}

export interface FileUploadStorage {
  assetScope: AssetScopeEnum
  scopeKey: string
  onUpload: ReturnType<typeof onUploadTipTapFile>
}

declare module '@tiptap/core' {
  interface EditorEvents {
    enter: {editor: TipTapEditor}
  }
  interface Storage {
    fileUpload: FileUploadStorage
  }
  interface Commands<ReturnType> {
    fileUpload: {
      setFileUpload: (targetType: FileUploadTargetType) => ReturnType
      setFileBlock: (attrs: FileBlockAttrs & {pos?: number}) => ReturnType
    }
  }
}

export const FileUploadBase = Node.create({
  name: 'fileUpload',

  isolating: true,

  defining: true,

  group: 'block',

  draggable: true,

  selectable: true,

  inline: false,
  addAttributes() {
    return {
      targetType: {
        default: 'file',
        parseHTML: (element) => element.getAttribute('target-type'),
        renderHTML: (attributes) => ({
          'target-type': attributes.targetType
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

  renderHTML({HTMLAttributes}) {
    return ['div', mergeAttributes(HTMLAttributes, {'data-type': this.name})]
  }
})
