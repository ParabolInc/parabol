import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'

export interface HandleJiraCreateVariables {
  cloudName: string
  key: string
  summary: string
  teamId: string
  url: string
}

const handleJiraCreateIssue = (
  {cloudName, key, summary, teamId, url}: HandleJiraCreateVariables,
  // newNode: RecordProxy | null,
  store: RecordSourceSelectorProxy
) => {
  const team = store.get(teamId)
  if (!team) return
  const newJiraIssue = {
    cloudName,
    key,
    summary,
    url
  }
  const jiraIssueProxy = createProxyRecord(store, 'jiraIssue', newJiraIssue)
  const jiraIssuesConn = getJiraIssuesConn(team)
  const now = new Date().toISOString()
  if (!jiraIssuesConn) return
  const newEdge = ConnectionHandler.createEdge(
    store,
    jiraIssuesConn,
    jiraIssueProxy,
    'JiraIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)
}

export default handleJiraCreateIssue
