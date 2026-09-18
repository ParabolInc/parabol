import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import toTeamMemberId from '~/utils/relay/toTeamMemberId'
import SearchQueryId from '../../shared/gqlIds/SearchQueryId'
import getJiraIssuesConn from '../connections/getJiraIssuesConn'

const handleJiraCreateIssue = (task: RecordProxy<any>, store: RecordSourceSelectorProxy) => {
  const integration = task.getLinkedRecord('integration')
  if (!integration) return
  const teamId = task.getValue('teamId')
  const meetingId = task.getValue('meetingId')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer?.getValue('id') as string
  if (!viewerId) return
  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = store.get(teamMemberId)
  const integrations = teamMember?.getLinkedRecord('integrations')
  const atlassian = integrations?.getLinkedRecord('atlassian')
  const searchQueryId = SearchQueryId.join('jira', meetingId)
  const searchQueryRecord = store.get(searchQueryId)
  const queryString = (searchQueryRecord?.getValue('queryString') as string | undefined)?.trim()
  const isJql = searchQueryRecord?.getValue('isAdvancedQuery') as boolean | undefined
  const projectKeyFilters = searchQueryRecord
    ?.getLinkedRecords('filters')
    ?.filter((filter) => filter.getValue('key') === 'project')
    .map((filter) => filter.getValue('value') as string)
  const typename = integration.getType()
  if (typename === 'JiraIssue') {
    const jiraIssuesConn = getJiraIssuesConn(atlassian, isJql, queryString, projectKeyFilters)
    if (!jiraIssuesConn) return
    const now = new Date().toISOString()
    const newEdge = ConnectionHandler.createEdge(
      store,
      jiraIssuesConn,
      integration,
      'JiraIssueEdge'
    )
    newEdge.setValue(now, 'cursor')
    ConnectionHandler.insertEdgeBefore(jiraIssuesConn, newEdge)
  }
}

export default handleJiraCreateIssue
