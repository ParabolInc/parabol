import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {GitHubScopingResultsAdapter_query$key} from '../../__generated__/GitHubScopingResultsAdapter_query.graphql'
import type {GitHubScopingResultsAdapterPaginationQuery} from '../../__generated__/GitHubScopingResultsAdapterPaginationQuery.graphql'
import type {GitHubScopingResultsAdapterQuery} from '../../__generated__/GitHubScopingResultsAdapterQuery.graphql'
import GitHubIssueId from '../../shared/gqlIds/GitHubIssueId'
import type {GQLType} from '../../types/generics'
import getNonNullEdges from '../../utils/getNonNullEdges'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query GitHubScopingResultsAdapterQuery($teamId: ID!, $queryString: String!) {
    ...GitHubScopingResultsAdapter_query
  }
`

const GitHubScopingResultsAdapter = (
  props: ResultsAdapterProps<GitHubScopingResultsAdapterQuery>
) => {
  const {queryRef, children} = props
  const queryData = usePreloadedQuery<GitHubScopingResultsAdapterQuery>(query, queryRef)
  const {data, hasNext, isLoadingNext, loadNext} = usePaginationFragment<
    GitHubScopingResultsAdapterPaginationQuery,
    GitHubScopingResultsAdapter_query$key
  >(
    graphql`
      fragment GitHubScopingResultsAdapter_query on Query
      @argumentDefinitions(cursor: {type: "String"}, count: {type: "Int", defaultValue: 25})
      @refetchable(queryName: "GitHubScopingResultsAdapterPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              github {
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
                    search(first: $count, after: $cursor, type: ISSUE, query: $queryString)
                      @connection(key: "GitHubScopingSearchResults_search") {
                      edges {
                        node {
                          __typename
                          ... on _xGitHubIssue {
                            id
                            title
                            number
                            repository {
                              nameWithOwner
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
  const github = data.viewer.teamMember?.integrations.github
  const error = github?.api?.errors?.[0]?.message ?? undefined
  const edges = github?.api?.query?.search?.edges
  const items = useMemo(
    () =>
      getNonNullEdges(edges ?? [])
        .filter((edge) => edge.node.__typename === '_xGitHubIssue')
        .map(({node}) => node as GQLType<typeof node, '_xGitHubIssue'>)
        .map(({number, title, url, repository}) => {
          const {nameWithOwner} = repository
          const linkText = `#${number} ${nameWithOwner}`
          return {
            serviceTaskId: GitHubIssueId.join(nameWithOwner, number),
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

export default GitHubScopingResultsAdapter
