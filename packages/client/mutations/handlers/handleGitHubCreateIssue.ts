import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import type {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
import readScopingSearchStateFromRelayStore from '../../utils/relay/readScopingSearchStateFromRelayStore'
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
  const {queryString} = readScopingSearchStateFromRelayStore(store, meetingId, 'github')
  const typename = integration.getType()
  if (typename !== '_xGitHubIssue') return
  const githubIssueConn = getGitHubIssuesConn(github, queryString.trim())
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
