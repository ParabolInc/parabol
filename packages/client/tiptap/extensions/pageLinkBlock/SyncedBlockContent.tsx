import type {Editor} from '@tiptap/core'
import {useEffect} from 'react'
import {GQLID} from '../../../utils/GQLID'
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

const isPlacementsChange = (payload: string) => {
  try {
    return JSON.parse(payload)?.type === 'syncedBlockPlacementsChanged'
  } catch {
    return false
  }
}

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
      if (isPlacementsChange(payload)) onPlacementsChange()
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
      pageId={GQLID.toKey(pageCode, 'page')}
      hostEditor={hostEditor}
      getPos={getPos}
      getSize={getSize}
      onChromeChange={onChromeChange}
    />
  )
}
