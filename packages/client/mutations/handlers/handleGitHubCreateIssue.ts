import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '../../shared/gqlIds/SearchQueryId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
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
  const githubSearchQueryId = SearchQueryId.join('github', meetingId)
  const githubSearchQuery = store.get(githubSearchQueryId)
  const queryString = githubSearchQuery?.getValue('queryString') as string | undefined
  const query = queryString?.trim() ?? ''
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
