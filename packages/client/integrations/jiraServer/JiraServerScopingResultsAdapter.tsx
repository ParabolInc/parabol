import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {JiraServerScopingResultsAdapter_query$key} from '../../__generated__/JiraServerScopingResultsAdapter_query.graphql'
import type {JiraServerScopingResultsAdapterPaginationQuery} from '../../__generated__/JiraServerScopingResultsAdapterPaginationQuery.graphql'
import type {JiraServerScopingResultsAdapterQuery} from '../../__generated__/JiraServerScopingResultsAdapterQuery.graphql'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query JiraServerScopingResultsAdapterQuery(
    $teamId: ID!
    $queryString: String
    $isJQL: Boolean!
    $projectKeyFilters: [ID!]
  ) {
    ...JiraServerScopingResultsAdapter_query
  }
`

const JiraServerScopingResultsAdapter = (
  props: ResultsAdapterProps<JiraServerScopingResultsAdapterQuery>
) => {
  const {queryRef, children} = props
  const queryData = usePreloadedQuery<JiraServerScopingResultsAdapterQuery>(query, queryRef)
  const {data, hasNext, isLoadingNext, loadNext} = usePaginationFragment<
    JiraServerScopingResultsAdapterPaginationQuery,
    JiraServerScopingResultsAdapter_query$key
  >(
    graphql`
      fragment JiraServerScopingResultsAdapter_query on Query
      @argumentDefinitions(first: {type: "Int", defaultValue: 25}, after: {type: "String"})
      @refetchable(queryName: "JiraServerScopingResultsAdapterPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              jiraServer {
                issues(
                  first: $first
                  after: $after
                  queryString: $queryString
                  isJQL: $isJQL
                  projectKeyFilters: $projectKeyFilters
                ) @connection(key: "JiraServerScopingSearchResults_issues") {
                  error {
                    message
                  }
                  edges {
                    node {
                      id
                      ... on JiraServerIssue {
                        summary
                        url
                        issueKey
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
  const issues = data.viewer.teamMember?.integrations.jiraServer?.issues
  const error = issues?.error?.message
  const edges = issues?.edges
  const items = useMemo(
    () =>
      (edges ?? []).map(({node}) => ({
        serviceTaskId: node.id,
        summary: node.summary,
        url: node.url,
        linkText: node.issueKey,
        linkTitle: `Jira Data Center Issue #${node.issueKey}`
      })),
    [edges]
  )
  return children({items, error, hasNext, isLoadingNext, loadNext: () => loadNext(20)})
}

export default JiraServerScopingResultsAdapter
