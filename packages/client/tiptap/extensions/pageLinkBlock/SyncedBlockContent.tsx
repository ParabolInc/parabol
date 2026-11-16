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
  onPlacementsChange: () => void
}

const PLACEMENTS_CHANGED = JSON.stringify({type: 'syncedBlockPlacementsChanged'})

export const SyncedBlockContent = (props: Props) => {
  const {
    pageCode,
    hostEditor,
    getPos,
    getSize,
    onChromeChange,
    onStatusChange,
    onPlacementsChange
  } = props
  const {provider, status, retry} = useSyncedBlockProvider(pageCode)
  useEffect(() => {
    onStatusChange(status)
  }, [status, onStatusChange])
  useEffect(() => {
    const handleStateless = ({payload}: {payload: string}) => {
      if (payload === PLACEMENTS_CHANGED) onPlacementsChange()
    }
    provider.on('stateless', handleStateless)
    return () => {
      provider.off('stateless', handleStateless)
    }
  }, [provider, onPlacementsChange])
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
