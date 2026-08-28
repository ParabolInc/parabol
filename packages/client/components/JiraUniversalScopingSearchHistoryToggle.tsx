import {commitLocalUpdate} from 'react-relay'
import useAtmosphere from '../hooks/useAtmosphere'
import IntegrationRepoId from '../shared/gqlIds/IntegrationRepoId'
import JiraProjectId from '../shared/gqlIds/JiraProjectId'
import SearchQueryId from '../shared/gqlIds/SearchQueryId'
import ScopingSearchHistoryToggle from './ScopingSearchHistoryToggle'

interface Props {
  service: 'jira' | 'jiraServer'
  savedQueries?: readonly {
    readonly id: string
    readonly queryString: string
    readonly isJQL: boolean
    readonly projectKeyFilters: readonly string[]
  }[]
  meetingId: string
  onDeleteQuery: (id: string) => void
}

const JiraUniversalScopingSearchHistoryToggle = (props: Props) => {
  const {savedQueries, meetingId, onDeleteQuery, service} = props
  const atmosphere = useAtmosphere()

  const searchQueries =
    savedQueries?.map((jiraSearchQuery) => {
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
        .map((filter) => {
          return service === 'jiraServer'
            ? IntegrationRepoId.split(filter).projectKey
            : JiraProjectId.split(filter).projectKey
        })
        .join(', ')

      return {
        id,
        labelFirstLine: queryStringLabel,
        labelSecondLine: projectFilters && `in ${projectFilters}`,
        onClick: selectQuery,
        onDelete: () => onDeleteQuery(id)
      }
    }) ?? []

  return <ScopingSearchHistoryToggle searchQueries={searchQueries} />
}

export default JiraUniversalScopingSearchHistoryToggle
