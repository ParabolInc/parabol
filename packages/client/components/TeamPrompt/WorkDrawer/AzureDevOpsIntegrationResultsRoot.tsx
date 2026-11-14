import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import azureDevOpsIntegrationResultsQuery, {
  type AzureDevOpsIntegrationResultsQuery
} from '../../../__generated__/AzureDevOpsIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import AzureDevOpsIntegrationResults from './AzureDevOpsIntegrationResults'

interface Props {
  teamId: string
  where: string
  projectIds: readonly string[]
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const MAX_WORK_ITEMS = 50

const AzureDevOpsIntegrationResultsRoot = (props: Props) => {
  const {teamId, where, projectIds, searchQuery, onResultCount} = props
  const queryRef = useQueryLoaderNow<AzureDevOpsIntegrationResultsQuery>(
    azureDevOpsIntegrationResultsQuery,
    {teamId, where, projectIds, first: MAX_WORK_ITEMS},
    'network-only'
  )
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <AzureDevOpsIntegrationResults
            teamId={teamId}
            queryRef={queryRef}
            searchQuery={searchQuery}
            onResultCount={onResultCount}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default AzureDevOpsIntegrationResultsRoot
