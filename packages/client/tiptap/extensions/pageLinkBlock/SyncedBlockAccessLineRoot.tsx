import {Suspense} from 'react'
import syncedBlockAccessLineQuery, {
  type SyncedBlockAccessLineQuery
} from '../../../__generated__/SyncedBlockAccessLineQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {GQLID} from '../../../utils/GQLID'
import {SyncedBlockAccessLine} from './SyncedBlockAccessLine'

interface Props {
  pageCode: number
}

export const SyncedBlockAccessLineRoot = ({pageCode}: Props) => {
  const queryRef = useQueryLoaderNow<SyncedBlockAccessLineQuery>(syncedBlockAccessLineQuery, {
    pageId: GQLID.toKey(pageCode, 'page')
  })
  return (
    <Suspense fallback={null}>{queryRef && <SyncedBlockAccessLine queryRef={queryRef} />}</Suspense>
  )
}
