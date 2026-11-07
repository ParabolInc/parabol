import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {ClickUpScopingResultsAdapter_query$key} from '../../__generated__/ClickUpScopingResultsAdapter_query.graphql'
import type {ClickUpScopingResultsAdapterPaginationQuery} from '../../__generated__/ClickUpScopingResultsAdapterPaginationQuery.graphql'
import type {ClickUpScopingResultsAdapterQuery} from '../../__generated__/ClickUpScopingResultsAdapterQuery.graphql'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'
import getClickUpTaskLinkTitle from './getClickUpTaskLinkTitle'

const query = graphql`
  query ClickUpScopingResultsAdapterQuery($teamId: ID!, $queryString: String, $listIds: [ID!]) {
    ...ClickUpScopingResultsAdapter_query
  }
`

const ClickUpScopingResultsAdapter = (
  props: ResultsAdapterProps<ClickUpScopingResultsAdapterQuery>
) => {
  const {queryRef, children} = props
  const queryData = usePreloadedQuery<ClickUpScopingResultsAdapterQuery>(query, queryRef)
  const {data, hasNext, isLoadingNext, loadNext} = usePaginationFragment<
    ClickUpScopingResultsAdapterPaginationQuery,
    ClickUpScopingResultsAdapter_query$key
  >(
    graphql`
      fragment ClickUpScopingResultsAdapter_query on Query
      @argumentDefinitions(first: {type: "Int", defaultValue: 25}, after: {type: "String"})
      @refetchable(queryName: "ClickUpScopingResultsAdapterPaginationQuery") {
        viewer {
          teamMember(teamId: $teamId) {
            integrations {
              clickup {
                tasks(first: $first, after: $after, queryString: $queryString, listIds: $listIds)
                  @connection(key: "ClickUpScopingSearchResults_tasks") {
                  error {
                    message
                  }
                  edges {
                    node {
                      id
                      title
                      url
                      taskId
                      customId
                      listName
                      folderName
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
  const tasks = data.viewer.teamMember?.integrations.clickup.tasks
  const error = tasks?.error?.message
  const edges = tasks?.edges
  const items = useMemo(
    () =>
      (edges ?? []).map(({node}) => ({
        serviceTaskId: node.id,
        summary: node.title,
        url: node.url,
        linkText: node.customId ?? node.taskId,
        linkTitle: getClickUpTaskLinkTitle(node)
      })),
    [edges]
  )
  return children({items, error, hasNext, isLoadingNext, loadNext: () => loadNext(25)})
}

export default ClickUpScopingResultsAdapter
