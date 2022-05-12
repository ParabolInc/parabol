import React from 'react'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

interface Props {
  service: 'jira' | 'jiraServer'
  jiraSearchQueries?: readonly {
    readonly id: string
    readonly queryString: string
    readonly isJQL: boolean
    readonly projectKeyFilters: readonly string[]
  }[]
  meetingId: string
  teamId: string
}

const JiraUniversalScopingSearchHistoryToggle = (props: Props) => {
  const {jiraSearchQueries, meetingId, teamId, service} = props
  const atmosphere = useAtmosphere()

  const searchQueries =
    jiraSearchQueries?.map((jiraSearchQuery) => {
      const {id, queryString, isJQL, projectKeyFilters} = jiraSearchQuery

      const selectQuery = () => {
        commitLocalUpdate(atmosphere, (store) => {
          const searchQueryId = SearchQueryId.join(service, meetingId)
          const jiraSearchQuery = store.get(searchQueryId)!
          jiraSearchQuery.setValue(isJQL, 'isJQL')
          jiraSearchQuery.setValue(queryString, 'queryString')
          jiraSearchQuery.setValue(projectKeyFilters as string[], 'projectKeyFilters')
        })
      }
      const queryStringLabel = isJQL ? queryString : `“${queryString}”`
      const projectFilters = projectKeyFilters
        .map((filter) => filter.slice(filter.indexOf(':') + 1))
        .join(', ')

      // TODO: migrate Jira to use the new table and use generic mutation
      const deleteJiraQuery = () => {
        PersistJiraSearchQueryMutation(atmosphere, {
          teamId,
          input: {
            queryString,
            isJQL,
            projectKeyFilters: projectKeyFilters as string[],
            isRemove: true
          }
        })
      }

      const deleteJiraServerQuery = () => {
        // TODO
      }

      return {
        id,
        labelFirstLine: queryStringLabel,
        labelSecondLine: projectFilters && `in ${projectFilters}`,
        onClick: selectQuery,
        onDelete: service === 'jira' ? deleteJiraQuery : deleteJiraServerQuery
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default JiraUniversalScopingSearchHistoryToggle
