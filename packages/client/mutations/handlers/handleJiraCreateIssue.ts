import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import toSearchQueryId from '~/utils/relay/toSearchQueryId'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'
import {SearchQueryMeetingPropName} from '~/utils/relay/LocalPokerHandler'

const handleJiraCreateIssue = (payload: RecordProxy<any>, store: RecordSourceSelectorProxy) => {
  const teamId = payload.getValue('teamId')
  const meetingId = payload.getValue('meetingId')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer?.getValue('id') as string
  if (!viewerId) return
  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = store.get(teamMemberId)
  const integrations = teamMember?.getLinkedRecord('integrations')
  const atlassian = integrations?.getLinkedRecord('atlassian')
  const jiraSearchQueryId = toSearchQueryId(SearchQueryMeetingPropName.jira, meetingId)
  const jiraSearchQuery = store.get(jiraSearchQueryId)
  const queryString = jiraSearchQuery?.getValue('queryString') as string | undefined
  const isJql = jiraSearchQuery?.getValue('isJql') as boolean | undefined
  const projectKeyFilters = jiraSearchQuery?.getValue('projectKeyFilters') as string[] | undefined

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
  const jiraIssuesConn = getJiraIssuesConn(atlassian, isJql, queryString, projectKeyFilters)
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
