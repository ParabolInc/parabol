import type {AuthorizedScope, HocuspocusProvider} from '@hocuspocus/provider'
import type {Editor} from '@tiptap/core'
import {useEffect, useState} from 'react'
import {TipTapEditor} from '../../../components/TipTapEditor/TipTapEditor'
import {useTipTapPageEditor} from '../../../hooks/useTipTapPageEditor'

export interface SyncedBlockChrome {
  editor: Editor
  isViewOnly: boolean
}

interface Props {
  provider: HocuspocusProvider
  pageId: string
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
  onChromeChange: (chrome: SyncedBlockChrome | null) => void
}

export const SyncedBlockEditor = (props: Props) => {
  const {provider, pageId, hostEditor, getPos, getSize, onChromeChange} = props
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
  const [authorizedScope, setAuthorizedScope] = useState(provider.authorizedScope)
  const [isHostEditable, setIsHostEditable] = useState(hostEditor.isEditable)
  const isViewOnly = authorizedScope === 'readonly' || !isHostEditable

  useEffect(() => {
    const handleAuthenticated = ({scope}: {scope: AuthorizedScope}) => setAuthorizedScope(scope)
    const handleHostUpdate = () => setIsHostEditable(hostEditor.isEditable)
    setAuthorizedScope(provider.authorizedScope)
    handleHostUpdate()
    provider.on('authenticated', handleAuthenticated)
    hostEditor.on('update', handleHostUpdate)
    return () => {
      provider.off('authenticated', handleAuthenticated)
      hostEditor.off('update', handleHostUpdate)
    }
  }, [provider, hostEditor])

  useEffect(() => {
    if (!editor) return
    if (editor.isEditable === isViewOnly) editor.setEditable(!isViewOnly)
    onChromeChange({editor, isViewOnly})
  }, [editor, isViewOnly, onChromeChange])

  useEffect(() => () => onChromeChange(null), [onChromeChange])

  if (!editor) return null
  return (
    <div data-synced-editor>
      <TipTapEditor
        editor={editor}
        className='page-editor [&>.tiptap]:-ml-[19px] @min-[852px]/page:[&>.tiptap]:-ml-9 relative flex w-full [&>.tiptap]:box-content @min-[852px]/page:[&>.tiptap]:pl-9 [&>.tiptap]:pl-[19px] [&_.tiptap>h1:first-child]:hidden'
      />
    </div>
  )
}
