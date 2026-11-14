import {Suspense} from 'react'
import confluenceParentPageListQuery, {
  type ConfluenceParentPageListQuery
} from '../../__generated__/ConfluenceParentPageListQuery.graphql'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {
  ConfluenceParentPageList,
  type ConfluenceParentPageListProps
} from './ConfluenceParentPageList'

type Props = Omit<ConfluenceParentPageListProps, 'queryRef'>

export const ConfluenceParentPageListRoot = (props: Props) => {
  const {teamId, cloudId, spaceId, query} = props
  const queryRef = useQueryLoaderNow<ConfluenceParentPageListQuery>(
    confluenceParentPageListQuery,
    {teamId, cloudId, spaceId, query},
    'network-only'
  )
  return (
    <Suspense fallback={<div className='px-3 py-2 text-fg-muted text-sm'>Searching…</div>}>
      {queryRef && <ConfluenceParentPageList {...props} queryRef={queryRef} />}
    </Suspense>
  )
}
