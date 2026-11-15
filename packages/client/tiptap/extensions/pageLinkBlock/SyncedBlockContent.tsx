import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import {type SyncedBlockChrome, SyncedBlockEditor} from './SyncedBlockEditor'
import {SyncedBlockState} from './SyncedBlockState'
import {type SyncedBlockStatus, useSyncedBlockProvider} from './useSyncedBlockProvider'

interface Props {
  pageCode: number
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
  onChromeChange: (chrome: SyncedBlockChrome | null) => void
  onStatusChange: (status: SyncedBlockStatus) => void
}

export const SyncedBlockContent = (props: Props) => {
  const {pageCode, hostEditor, getPos, getSize, onChromeChange, onStatusChange} = props
  const {provider, status, retry} = useSyncedBlockProvider(pageCode)
  useEffect(() => {
    onStatusChange(status)
  }, [status, onStatusChange])
  if (status !== 'ready')
    return <SyncedBlockState status={status} pageCode={pageCode} onRetry={retry} />
  return (
    <SyncedBlockEditor
      provider={provider}
      pageId={`page:${pageCode}`}
      hostEditor={hostEditor}
      getPos={getPos}
      getSize={getSize}
      onChromeChange={onChromeChange}
    />
  )
}
