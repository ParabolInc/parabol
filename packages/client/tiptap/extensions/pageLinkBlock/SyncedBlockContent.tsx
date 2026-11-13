import type {Editor} from '@tiptap/core'
import {usePageProvider} from '../../../hooks/usePageProvider'
import {SyncedBlockEditor} from './SyncedBlockEditor'

interface Props {
  pageCode: number
  hostEditor: Editor
  getPos: () => number | undefined
  getSize: () => number
}

export const SyncedBlockContent = (props: Props) => {
  const {pageCode, hostEditor, getPos, getSize} = props
  const pageId = `page:${pageCode}`
  const {provider, synced} = usePageProvider(pageId)
  if (!synced) return <div className='h-6 rounded-sm bg-surface-hover' />
  return (
    <SyncedBlockEditor
      provider={provider}
      pageId={pageId}
      hostEditor={hostEditor}
      getPos={getPos}
      getSize={getSize}
    />
  )
}
