import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {Loader} from '~/utils/relay/renderLoader'
import {LinearIntegrationResultsRootQuery} from '../../../__generated__/LinearIntegrationResultsRootQuery.graphql'
import useQueryLoaderNow from '../../../hooks/useQueryLoaderNow'
import {makeLinearIssueFilter} from '../../../utils/makeLinearIssueFilter'
import ErrorBoundary from '../../ErrorBoundary'
import LinearIntegrationResults from './LinearIntegrationResults'

interface Props {
  linearViewerId: string
  selectedLinearIds: string[]
  teamId: string
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
  const {linearViewerId, selectedLinearIds, teamId} = props
  const projectsAndTeamsFilter = makeLinearIssueFilter('', selectedLinearIds)
  const involvesLinearViewerConds = [
    {assignee: {id: {eq: linearViewerId}}},
    {
      comments: {
        some: {
          user: {id: {eq: linearViewerId}},
          reactions: {some: {id: {eq: linearViewerId}}}
        }
      }
    },
    {creator: {id: {eq: linearViewerId}}},
    {reactions: {some: {id: {eq: linearViewerId}}}},
    {subscribers: {id: {eq: linearViewerId}}}
  ]
  const filter = !projectsAndTeamsFilter
    ? {
        or: involvesLinearViewerConds
      }
    : {
        ...projectsAndTeamsFilter,
        or: Array.isArray(projectsAndTeamsFilter.or)
          ? [...projectsAndTeamsFilter.or, ...involvesLinearViewerConds]
          : involvesLinearViewerConds
      }

  const queryRef = useQueryLoaderNow<LinearIntegrationResultsRootQuery>(
    linearIntegrationResultsQuery,
    {teamId, filter}
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
