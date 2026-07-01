import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import jiraIntegrationResultsQuery, {
  type JiraIntegrationResultsQuery
} from '../../../__generated__/JiraIntegrationResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import JiraIntegrationResults from './JiraIntegrationResults'

interface Props {
  teamId: string
  searchQuery: string
  onResultCount: (searchQuery: string, count: number) => void
}

const JiraIntegrationResultsRoot = (props: Props) => {
  const {teamId, searchQuery, onResultCount} = props
  const queryRef = useQueryLoaderNow<JiraIntegrationResultsQuery>(jiraIntegrationResultsQuery, {
    teamId,
    searchQuery
  })
  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <JiraIntegrationResults
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

export default JiraIntegrationResultsRoot
