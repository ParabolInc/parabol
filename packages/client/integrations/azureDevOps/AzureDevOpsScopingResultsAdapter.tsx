import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePreloadedQuery} from 'react-relay'
import type {AzureDevOpsScopingResultsAdapterQuery} from '../../__generated__/AzureDevOpsScopingResultsAdapterQuery.graphql'
import getCaughtErrorMessage from '../../utils/relay/getCaughtErrorMessage'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'

const query = graphql`
  query AzureDevOpsScopingResultsAdapterQuery(
    $teamId: ID!
    $first: Int
    $queryString: String
    $projectKeyFilters: [String!]!
    $isWIQL: Boolean!
  ) {
    viewer {
      teamMember(teamId: $teamId) {
        integrations {
          azureDevOps {
            workItems(
              first: $first
              queryString: $queryString
              projectKeyFilters: $projectKeyFilters
              isWIQL: $isWIQL
            ) @connection(key: "AzureDevOpsScopingSearchResults_workItems") @catch {
              edges {
                cursor
                node {
                  id
                  title
                  url
                  issueKey
                  project {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`

const AzureDevOpsScopingResultsAdapter = (
  props: ResultsAdapterProps<AzureDevOpsScopingResultsAdapterQuery>
) => {
  const {queryRef, children} = props
  const data = usePreloadedQuery<AzureDevOpsScopingResultsAdapterQuery>(query, queryRef)
  const workItemsResult = data.viewer.teamMember?.integrations.azureDevOps.workItems
  const error = getCaughtErrorMessage(workItemsResult)
  const edges = workItemsResult?.ok ? workItemsResult.value?.edges : undefined
  const items = useMemo(
    () =>
      (edges ?? []).map(({node}) => ({
        serviceTaskId: node.id,
        summary: node.title,
        url: node.url,
        linkText: `#${node.issueKey} ${node.project.name}`,
        linkTitle: `Azure DevOps Work Item #${node.issueKey}`
      })),
    [edges]
  )
  return children({items, error, hasNext: false})
}

export default AzureDevOpsScopingResultsAdapter
