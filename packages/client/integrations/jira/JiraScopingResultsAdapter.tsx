import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePreloadedQuery} from 'react-relay'
import type {JiraScopingResultsAdapterQuery} from '../../__generated__/JiraScopingResultsAdapterQuery.graphql'
import getCaughtErrorMessage from '../../utils/relay/getCaughtErrorMessage'
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
            ) @connection(key: "JiraScopingSearchResults_issues") @catch {
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
  const issuesResult = data.viewer.teamMember?.integrations.atlassian?.issues
  const error = getCaughtErrorMessage(issuesResult)
  const edges = issuesResult?.ok ? issuesResult.value?.edges : undefined
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
