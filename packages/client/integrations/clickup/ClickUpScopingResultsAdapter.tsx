import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {usePaginationFragment, usePreloadedQuery} from 'react-relay'
import type {ClickUpScopingResultsAdapter_query$key} from '../../__generated__/ClickUpScopingResultsAdapter_query.graphql'
import type {ClickUpScopingResultsAdapterPaginationQuery} from '../../__generated__/ClickUpScopingResultsAdapterPaginationQuery.graphql'
import type {ClickUpScopingResultsAdapterQuery} from '../../__generated__/ClickUpScopingResultsAdapterQuery.graphql'
import type {ResultsAdapterProps} from '../platform/ScopingSearchState'
import getClickUpTaskLinkTitle from './getClickUpTaskLinkTitle'
import readClickUpTaskLookup from './shared/readClickUpTaskLookup'

const NO_RECENT_MATCH =
  'No match among the 300 most recently updated ClickUp tasks. Filter by a list or paste a task link to search further.'
const NO_TASK_FOR_LOOKUP = 'No ClickUp task matches that link or ID.'

const getEmptyMessage = (queryString: string, hasOlderTasks: boolean) => {
  if (readClickUpTaskLookup(queryString)) return NO_TASK_FOR_LOOKUP
  return queryString && hasOlderTasks ? NO_RECENT_MATCH : undefined
}

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
  const edges = tasks?.edges
  const queryString = queryRef.variables.queryString ?? ''
  const isTextSearch = !!queryString
  const error =
    tasks?.error?.message ?? (edges?.length ? undefined : getEmptyMessage(queryString, hasNext))
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
  return children({
    items,
    error,
    hasNext: hasNext && !isTextSearch,
    isLoadingNext,
    loadNext: () => loadNext(25)
  })
}

export default ClickUpScopingResultsAdapter
