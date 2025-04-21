import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import {LinearIntegrationResultsRootQuery} from '../../../__generated__/LinearIntegrationResultsRootQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {makeLinearIssueFilter} from '../../../utils/makeLinearIssueFilter'
import ErrorBoundary from '../../ErrorBoundary'
import LinearIntegrationResults from './LinearIntegrationResults'

interface Props {
  teamId: string
  selectedLinearIds: string[]
}

// Define the GraphQL Query right here
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
  const {teamId, selectedLinearIds} = props
  const filter = makeLinearIssueFilter('', selectedLinearIds)

  // Load the query
  const queryRef = useQueryLoaderNow<LinearIntegrationResultsRootQuery>(
    linearIntegrationResultsQuery,
    {
      teamId: teamId,
      filter: filter
    }
  )

  return (
    <ErrorBoundary>
      <Suspense fallback={<Loader />}>
        {queryRef && <LinearIntegrationResults teamId={teamId} queryRef={queryRef} />}
      </Suspense>
    </ErrorBoundary>
  )
}

export default LinearIntegrationResultsRoot
