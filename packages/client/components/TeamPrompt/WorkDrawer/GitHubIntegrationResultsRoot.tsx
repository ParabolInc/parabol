import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import gitHubIntegrationResultsQuery, {
  type GitHubIntegrationResultsQuery
} from '../../../__generated__/GitHubIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import GitHubIntegrationResults from './GitHubIntegrationResults'

interface Props {
  teamId: string
  queryType: 'issue' | 'pullRequest'
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const GitHubIntegrationResultsRoot = (props: Props) => {
  const {teamId, queryType, searchQuery, onResultCount} = props
  const queryRef = useQueryLoaderNow<GitHubIntegrationResultsQuery>(gitHubIntegrationResultsQuery, {
    teamId,
    searchQuery
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <GitHubIntegrationResults
            queryRef={queryRef}
            queryType={queryType}
            searchQuery={searchQuery}
            teamId={teamId}
            onResultCount={onResultCount}
          />
        )}
      </Suspense>
    </ErrorBoundary>
  )
}

export default GitHubIntegrationResultsRoot
