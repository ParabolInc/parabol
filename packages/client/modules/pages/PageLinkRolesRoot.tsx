import {Suspense} from 'react'
import query, {
  type PageLinkRolesQuery,
  type PageRoleEnum
} from '../../__generated__/PageLinkRolesQuery.graphql'
import ErrorBoundary from '../../components/ErrorBoundary'
import useQueryLoaderNow from '../../hooks/useQueryLoaderNow'
import {PageLinkRoles} from './PageLinkRoles'

interface Props {
  pageIds: string[]
  onRoles: (roles: ReadonlyMap<number, PageRoleEnum | null>) => void
}

export const PageLinkRolesRoot = (props: Props) => {
  const {pageIds, onRoles} = props
  // preventSuspense keeps the old roles while a new set of links loads
  const queryRef = useQueryLoaderNow<PageLinkRolesQuery>(query, {pageIds}, undefined, true)
  return (
    <ErrorBoundary fallback={() => null}>
      <Suspense fallback={null}>
        {queryRef && <PageLinkRoles queryRef={queryRef} onRoles={onRoles} />}
      </Suspense>
    </ErrorBoundary>
  )
}
