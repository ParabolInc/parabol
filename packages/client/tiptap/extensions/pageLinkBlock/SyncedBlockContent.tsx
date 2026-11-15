import type {Editor} from '@tiptap/core'
import {type SyncedBlockChrome, SyncedBlockEditor} from './SyncedBlockEditor'
import {SyncedBlockState} from './SyncedBlockState'
import {useSyncedBlockProvider} from './useSyncedBlockProvider'

interface Props {
  pageCode: number
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
  onChromeChange: (chrome: SyncedBlockChrome | null) => void
}

export const SyncedBlockContent = (props: Props) => {
  const {pageCode, hostEditor, getPos, getSize, onChromeChange} = props
  const {provider, status, retry} = useSyncedBlockProvider(pageCode)
  if (status !== 'ready') return <SyncedBlockState status={status} onRetry={retry} />
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
