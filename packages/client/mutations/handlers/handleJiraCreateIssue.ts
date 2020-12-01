import {RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {insertNodeBeforeInConn} from '~/utils/relay/insertNode'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'
import toSearchQueryId from '../../utils/relay/toSearchQueryId'

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
  const jiraSearchQueryId = toSearchQueryId('jiraSearchQuery', meetingId)
  const jiraSearchQuery = store.get(jiraSearchQueryId)
  const queryString = jiraSearchQuery?.getValue('queryString') as string | undefined
  const isJql = jiraSearchQuery?.getValue('isJql') as boolean | undefined
  const projectKeyFilters = jiraSearchQuery?.getValue('projectKeyFilters') as string[] | undefined
  const jiraIssue = payload.getLinkedRecord('jiraIssue')
  const jiraIssuesConn = getJiraIssuesConn(atlassian, isJql, queryString, projectKeyFilters)
  if (!jiraIssuesConn) return
  insertNodeBeforeInConn(jiraIssuesConn, jiraIssue, store, 'JiraIssueEdge')
}

export default handleJiraCreateIssue
