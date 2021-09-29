import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getJiraIssuesConn = (
  atlassianTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  isJql: boolean | undefined,
  queryString: string | undefined,
  projectKeyFilters: string[] | undefined
) => {
  if (atlassianTeamMemberIntegration) {
    return ConnectionHandler.getConnection(
      atlassianTeamMemberIntegration,
      'JiraScopingSearchResults_issues',
      {
        isJQL: isJql || false,
        projectKeyFilters: projectKeyFilters || [],
        queryString: queryString || ''
      }
    )
  }
  return null
}

export default getJiraIssuesConn
