import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import type {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
import toGitHubQueryString from '../../integrations/github/gitHubSearchTokens'
import SearchQueryId from '../../shared/gqlIds/SearchQueryId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import getGitHubIssuesConn from '../connections/getGitHubIssuesConn'

const handleGitHubCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutation['response']['createTask']['task']>>,
  store: RecordSourceSelectorProxy
) => {
  const integration = task.getLinkedRecord('integration')
  if (!integration) return
  const teamId = task.getValue('teamId')
  const meetingId = task.getValue('meetingId')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer?.getValue('id') as string
  if (!viewerId || !meetingId) return
  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = store.get(teamMemberId)
  const integrations = teamMember?.getLinkedRecord('integrations')
  const github = integrations
    ?.getLinkedRecord('github')
    ?.getLinkedRecord('api')
    ?.getLinkedRecord('query')
  const searchQueryId = SearchQueryId.join('github', meetingId)
  const searchQueryRecord = store.get(searchQueryId)
  const filters =
    searchQueryRecord?.getLinkedRecords('filters')?.map((filter) => ({
      key: filter.getValue('key') as string,
      value: filter.getValue('value') as string
    })) ?? []
  const query = toGitHubQueryString({
    queryString: (searchQueryRecord?.getValue('queryString') as string | undefined) ?? '',
    isAdvancedQuery: false,
    filters
  })
  const typename = integration.getType()
  if (typename !== '_xGitHubIssue') return
  const githubIssueConn = getGitHubIssuesConn(github, query)
  if (!githubIssueConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    githubIssueConn,
    integration,
    'GitHubIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(githubIssueConn, newEdge)
}

export default handleGitHubCreateIssue
