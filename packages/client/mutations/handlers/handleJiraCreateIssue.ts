import {ConnectionHandler, RecordSourceSelectorProxy} from 'relay-runtime'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'

export interface HandleJiraCreateVariables {
  cloudName: string
  key: string
  summary: string
  teamId: string
  url: string
  jiraIssueId?: string
}

const handleJiraCreateIssue = (payload, store: RecordSourceSelectorProxy) => {
  const teamId = payload.getValue('teamId')
  const team = store.get(teamId)
  if (!team) return
  const issue = payload.getLinkedRecord('issue')
  const key = issue.getValue('key')
  const summary = issue.getValue('summary')
  const url = issue.getValue('url')
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
  ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)
}

export default handleJiraCreateIssue
