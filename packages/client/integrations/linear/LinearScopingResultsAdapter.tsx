import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {LinearScopingResultsAdapter_query$key} from '../../__generated__/LinearScopingResultsAdapter_query.graphql'
import type {LinearScopingResultsAdapterPaginationQuery} from '../../__generated__/LinearScopingResultsAdapterPaginationQuery.graphql'
import type {LinearScopingResultsAdapterQuery} from '../../__generated__/LinearScopingResultsAdapterQuery.graphql'
import LinearIssueId from '../../shared/gqlIds/LinearIssueId'
import LinearProjectId from '../../shared/gqlIds/LinearProjectId'
import type {GQLType} from '../../types/generics'
import {getLinearRepoName} from '../../utils/getLinearRepoName'
import getNonNullEdges from '../../utils/getNonNullEdges'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query LinearScopingResultsAdapterQuery($teamId: ID!, $filter: _xLinearIssueFilter) {
    ...LinearScopingResultsAdapter_query
  }
`

const LinearScopingResultsAdapter = (
  props: ResultsAdapterProps<LinearScopingResultsAdapterQuery>
) => {
  const {queryRef, children} = props
  const queryData = usePreloadedQuery<LinearScopingResultsAdapterQuery>(query, queryRef)
  const {data, hasNext, isLoadingNext, loadNext} = usePaginationFragment<
    LinearScopingResultsAdapterPaginationQuery,
    LinearScopingResultsAdapter_query$key
  >(
    graphql`
      fragment LinearScopingResultsAdapter_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "LinearScopingResultsAdapterPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              linear {
                api {
                  errors {
                    message
                    locations {
                      line
                      column
                    }
                    path
                  }
                  query {
                    issues(first: $count, after: $cursor, filter: $filter)
                      @connection(key: "LinearScopingSearchResults_issues") {
                      edges {
                        node {
                          __typename
                          ... on _xLinearIssue {
                            id
                            identifier
                            title
                            project {
                              id
                              name
                            }
                            team {
                              id
                              displayName
                            }
                            url
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `,
    queryData
  )
  const linear = data.viewer.teamMember?.integrations.linear
  const error = linear?.api?.errors?.[0]?.message ?? undefined
  const edges = linear?.api?.query?.issues?.edges
  const items = useMemo(
    () =>
      getNonNullEdges(edges ?? [])
        .filter((edge) => edge.node.__typename === '_xLinearIssue')
        .map(({node}) => node as GQLType<typeof node, '_xLinearIssue'>)
        .map(({id, identifier, title, project, team, url}) => {
          const linkText = `${identifier} ${getLinearRepoName(project, team.displayName)}`
          return {
            serviceTaskId: LinearIssueId.join(LinearProjectId.join(team.id, project?.id), id),
            summary: title,
            url,
            linkText,
            linkTitle: linkText
          }
        }),
    [edges]
  )
  return children({items, error, hasNext, isLoadingNext, loadNext: () => loadNext(20)})
}

export default LinearScopingResultsAdapter
