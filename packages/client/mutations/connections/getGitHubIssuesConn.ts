import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getGitHubIssuesConn = (
  githubTeamMemberIntegration: ReadOnlyRecordProxy | null | undefined,
  query: string | undefined
) => {
  if (githubTeamMemberIntegration) {
    const conn = ConnectionHandler.getConnection(
      githubTeamMemberIntegration,
      'GitHubScopingSearchResults_search',
      {
        // query must be trimmed because it is trimmed in GitHubSearchResultsRoot
        query,
        type: 'ISSUE'
      }
    )
    return conn
  }
  return null
}

export default getGitHubIssuesConn
