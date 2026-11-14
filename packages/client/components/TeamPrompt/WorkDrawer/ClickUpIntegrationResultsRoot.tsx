import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import clickUpIntegrationResultsQuery, {
  type ClickUpIntegrationResultsQuery
} from '../../../__generated__/ClickUpIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import ClickUpIntegrationResults from './ClickUpIntegrationResults'

interface Props {
  teamId: string
  listIds: readonly string[]
  updatedAfter: string | null
  updatedBefore: string | null
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const ClickUpIntegrationResultsRoot = (props: Props) => {
  const {teamId, listIds, updatedAfter, updatedBefore, searchQuery, onResultCount} = props
  const queryRef = useQueryLoaderNow<ClickUpIntegrationResultsQuery>(
    clickUpIntegrationResultsQuery,
    {teamId, listIds, updatedAfter, updatedBefore}
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <ClickUpIntegrationResults
            queryRef={queryRef}
            teamId={teamId}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default ClickUpIntegrationResultsRoot
