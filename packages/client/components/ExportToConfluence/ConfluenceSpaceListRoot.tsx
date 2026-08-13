import {Suspense} from 'react'
import confluenceSpaceListQuery, {
  type ConfluenceSpaceListQuery
} from '../../__generated__/ConfluenceSpaceListQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {ConfluenceSpaceList, type ConfluenceSpaceListProps} from './ConfluenceSpaceList'

type Props = Omit<ConfluenceSpaceListProps, 'queryRef'>

export const ConfluenceSpaceListRoot = (props: Props) => {
  const {teamId, cloudId} = props
  const queryRef = useQueryLoaderNow<ConfluenceSpaceListQuery>(
    confluenceSpaceListQuery,
    {teamId, cloudId},
    'network-only'
  )
  return (
    <Suspense fallback={<div className='px-3 py-2 text-fg-muted text-sm'>Loading spaces…</div>}>
      {queryRef && <ConfluenceSpaceList {...props} queryRef={queryRef} />}
    </Suspense>
  )
}
