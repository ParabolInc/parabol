import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import type {LinearIntegrationResultsRootQuery} from '../../../__generated__/LinearIntegrationResultsRootQuery.graphql'
import type {_xLinearIssueFilter} from '../../../__generated__/LinearScopingSearchResultsQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import ErrorBoundary from '../../ErrorBoundary'
import LinearIntegrationResults from './LinearIntegrationResults'

interface Props {
  filter: _xLinearIssueFilter
  searchQuery: string
  teamId: string
  onResultCount: (searchQuery: string, count: number) => void
}

const linearIntegrationResultsQuery = graphql`
  query LinearIntegrationResultsRootQuery(
    $teamId: ID!
    $filter: _xLinearIssueFilter
    $count: Int = 20
    $cursor: String
  ) {
    ...LinearIntegrationResults_query
      @arguments(teamId: $teamId, filter: $filter, count: $count, cursor: $cursor)
  }
`

const LinearIntegrationResultsRoot = (props: Props) => {
  const {filter, searchQuery, teamId, onResultCount} = props
  const queryRef = useQueryLoaderNow<LinearIntegrationResultsRootQuery>(
    linearIntegrationResultsQuery,
    {teamId, filter}
  )

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && (
          <LinearIntegrationResults
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

export default LinearIntegrationResultsRoot
