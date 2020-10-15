import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'

const handleJiraCreateIssue = (payload, store: RecordSourceSelectorProxy) => {
  const teamId = payload.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  const jiraIssue = payload.getLinkedRecord('jiraIssue')
  const key = jiraIssue.getValue('key')
  const summary = jiraIssue.getValue('summary')
  const url = jiraIssue.getValue('url')
  const newJiraIssue = {
    key,
    summary,
    url
  }
  const jiraIssueProxy = createProxyRecord(store, 'JiraIssue', newJiraIssue)
  const jiraIssuesConn = getJiraIssuesConn(team)
  if (!jiraIssuesConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    jiraIssuesConn,
    jiraIssueProxy,
    'JiraIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  const node = newEdge.getLinkedRecord('node')
  const newJiraIssueId = jiraIssue.getValue('id')
  node?.setValue(newJiraIssueId, 'id')
  ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)
}

export default handleJiraCreateIssue
