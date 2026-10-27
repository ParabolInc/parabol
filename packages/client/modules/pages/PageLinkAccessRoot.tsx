import {Suspense} from 'react'
import query, {type PageLinkAccessQuery} from '../../__generated__/PageLinkAccessQuery.graphql'
import ErrorBoundary from '../../components/ErrorBoundary'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {PageLinkAccess} from './PageLinkAccess'

interface Props {
  pageIds: string[]
  onAccess: (canOpenByPageCode: ReadonlyMap<number, boolean>) => void
}

export const PageLinkAccessRoot = (props: Props) => {
  const {pageIds, onAccess} = props
  // preventSuspense keeps the old access while a new set of links loads
  const queryRef = useQueryLoaderNow<PageLinkAccessQuery>(
    query,
    {pageIds, first: pageIds.length},
    undefined,
    true
  )
  return (
    <ErrorBoundary fallback={() => null}>
      <Suspense fallback={null}>
        {queryRef && <PageLinkAccess queryRef={queryRef} onAccess={onAccess} />}
      </Suspense>
    </ErrorBoundary>
  )
}
