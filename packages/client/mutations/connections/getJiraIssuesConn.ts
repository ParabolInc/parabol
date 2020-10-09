import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getJiraIssuesConn = (viewer: ReadOnlyRecordProxy | null | undefined) => {
  if (viewer) {
    return ConnectionHandler.getConnection(viewer, 'JiraScopingSearchResults_jiraIssues', {
      isJQL: false
    })
  }
  return null
}

export default getJiraIssuesConn
