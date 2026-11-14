import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePreloadedQuery} from 'react-relay'
import type {JiraScopingResultsAdapterQuery} from '../../__generated__/JiraScopingResultsAdapterQuery.graphql'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query JiraScopingResultsAdapterQuery(
    $teamId: ID!
    $queryString: String
    $isJQL: Boolean!
    $projectKeyFilters: [ID!]
    $first: Int
  ) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          atlassian {
            issues(
              first: $first
              queryString: $queryString
              isJQL: $isJQL
              projectKeyFilters: $projectKeyFilters
            ) @connection(key: "JiraScopingSearchResults_issues") {
              error {
                message
              }
              edges {
                node {
                  id
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
`

const JiraScopingResultsAdapter = (props: ResultsAdapterProps<JiraScopingResultsAdapterQuery>) => {
  const {queryRef, children} = props
  const data = usePreloadedQuery<JiraScopingResultsAdapterQuery>(query, queryRef)
  const issues = data.viewer.teamMember?.integrations.atlassian?.issues
  const error = issues?.error?.message
  const edges = issues?.edges
  const items = useMemo(
    () =>
      (edges ?? []).map(({node}) => ({
        serviceTaskId: node.id,
        summary: node.summary,
        url: node.url,
        linkText: node.issueKey,
        linkTitle: `Jira Issue #${node.issueKey}`
      })),
    [edges]
  )
  return children({items, error, hasNext: false})
}

export default JiraScopingResultsAdapter
