import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getJiraIssuesConn = (
  viewer: ReadOnlyRecordProxy | null | undefined,
  queryString: string | undefined
) => {
  if (viewer) {
    return ConnectionHandler.getConnection(viewer, 'JiraScopingSearchResults_jiraIssues', {
      isJQL: false,
      queryString
    })
  }
  return null
}

export default getJiraIssuesConn
