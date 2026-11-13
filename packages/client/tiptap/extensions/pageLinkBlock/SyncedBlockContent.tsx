import type {Editor} from '@tiptap/core'
import {SyncedBlockEditor} from './SyncedBlockEditor'
import {SyncedBlockState} from './SyncedBlockState'
import {useSyncedBlockProvider} from './useSyncedBlockProvider'

interface Props {
  pageCode: number
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
}

export const SyncedBlockContent = (props: Props) => {
  const {pageCode, hostEditor, getPos, getSize} = props
  const {provider, status, retry} = useSyncedBlockProvider(pageCode)
  if (status !== 'ready') return <SyncedBlockState status={status} onRetry={retry} />
  return (
    <SyncedBlockEditor
      provider={provider}
      pageId={`page:${pageCode}`}
      hostEditor={hostEditor}
      getPos={getPos}
      getSize={getSize}
    />
  )
}
