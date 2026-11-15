import type {PreloadedQuery} from 'react-relay'
import type {SyncedBlockAccessLineQuery} from '../../../__generated__/SyncedBlockAccessLineQuery.graphql'
import {useSyncedBlockAccessLineQuery} from './useSyncedBlockAccessLineQuery'

interface Props {
  queryRef: PreloadedQuery<SyncedBlockAccessLineQuery>
}

export const SyncedBlockAccessLine = ({queryRef}: Props) => {
  const page = useSyncedBlockAccessLineQuery(queryRef)
  if (!page?.isParentLinked || !page.parentPage) return null
  return (
    <p className='m-0 text-[13px] text-fg-secondary'>
      Everyone who can open {page.parentPage.title || '<Untitled>'} can see this block.
    </p>
  )
}
