import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutationResponse} from '../../__generated__/CreateTaskMutation.graphql'
import getGitLabProjectsConn from '../connections/getGitLabProjectsConn'

const handleGitLabCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutationResponse['createTask']['task']>>,
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
  const gitlab = integrations
    ?.getLinkedRecord('gitlab')
    ?.getLinkedRecord('api')
    ?.getLinkedRecord('query')
  const typename = integration.getType()
  if (typename !== '_xGitLabIssue' && typename !== '_xGitLabProject') return
  const gitlabProjectsConn = getGitLabProjectsConn(gitlab, '') // TODO: add query string
  if (!gitlabProjectsConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    gitlabProjectsConn,
    integration,
    'GitLabIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(gitlabProjectsConn, newEdge)
}

export default handleGitLabCreateIssue
