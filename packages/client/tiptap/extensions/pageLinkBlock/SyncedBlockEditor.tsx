import type {HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {TipTapEditor} from '../../../components/TipTapEditor/TipTapEditor'
import {useTipTapPageEditor} from '../../../hooks/useTipTapPageEditor'
import {useEditablePage} from '../../../modules/pages/useEditablePage'

interface Props {
  provider: HocuspocusProvider
  pageId: string
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
}

export const SyncedBlockEditor = (props: Props) => {
  const {provider, pageId, hostEditor, getPos, getSize} = props
  const {editor} = useTipTapPageEditor(provider, {
    pageId,
    viewerRef: null,
    nested: {
      hostView: hostEditor.view,
      getPos,
      getSize,
      preferredName: hostEditor.storage.pageLinkBlock.preferredName,
      highestTier: hostEditor.storage.pageLinkBlock.highestTier
    }
  })
  useEditablePage(provider, editor!)
  if (!editor) return null
  return (
    <div data-synced-editor>
      <TipTapEditor
        editor={editor}
        className='page-editor relative flex w-full [&_.tiptap>h1:first-child]:hidden'
      />
    </div>
  )
}
