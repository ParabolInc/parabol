import React from 'react'
import {useTranslation} from 'react-i18next'
import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import PersistJiraSearchQueryMutation from '../mutations/PersistJiraSearchQueryMutation'
import RemoveJiraServerSearchQueryMutation from '../mutations/RemoveJiraServerSearchQueryMutation'
import IntegrationRepoId from '../shared/gqlIds/IntegrationRepoId'
import JiraProjectId from '../shared/gqlIds/JiraProjectId'
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

  const {t} = useTranslation()

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
      const queryStringLabel = isJQL
        ? queryString
        : t('JiraUniversalScopingSearchHistoryToggle.QueryString', {
            queryString
          })
      const projectFilters = projectKeyFilters
        .map((filter) => {
          return service === 'jiraServer'
            ? IntegrationRepoId.split(filter).projectKey
            : JiraProjectId.split(filter).projectKey
        })
        .join(', ')

      // TODO: migrate Jira to use the new table and use single mutation for both
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
        RemoveJiraServerSearchQueryMutation(atmosphere, {id, teamId})
      }

      return {
        id,
        labelFirstLine: queryStringLabel,
        labelSecondLine:
          projectFilters &&
          t('JiraUniversalScopingSearchHistoryToggle.InProjectFilters', {
            projectFilters
          }),
        onClick: selectQuery,
        onDelete: service === 'jira' ? deleteJiraQuery : deleteJiraServerQuery
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default JiraUniversalScopingSearchHistoryToggle
