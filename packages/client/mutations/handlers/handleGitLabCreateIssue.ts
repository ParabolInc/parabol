import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {gitlabIssueArgs} from '~/components/GitLabScopingSearchResultsRoot'
import createProxyRecord from '~/utils/relay/createProxyRecord'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutationResponse} from '../../__generated__/CreateTaskMutation.graphql'
import getGitLabProjectsConn from '../connections/getGitLabProjectsConn'
import {parseWebPath} from './../../utils/parseWebPath'

const handleGitLabCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutationResponse['createTask']['task']>>,
  store: RecordSourceSelectorProxy
) => {
  const integration = task.getLinkedRecord('integration')
  if (!integration) return
  const webPath = integration.getValue('webPath') as string | undefined
  const {fullPath} = webPath ? parseWebPath(webPath) : {fullPath: ''}
  const project = createProxyRecord(store, '_xGitLabProject', {
    fullPath
  })
  const issueEdge = createProxyRecord(store, '_xGitLabIssueEdge', {})
  issueEdge.setLinkedRecord(integration, 'node')

  const issueConn = createProxyRecord(store, '_xGitLabIssueConnection', {})
  issueConn.setLinkedRecords([issueEdge], 'edges')

  project.setLinkedRecord(issueConn, 'issues', gitlabIssueArgs)

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
  if (typename !== '_xGitLabIssue') return
  const gitlabProjectsConn = getGitLabProjectsConn(gitlab) // TODO: add query string
  if (!gitlabProjectsConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    gitlabProjectsConn,
    project,
    '_xGitLabProjectEdge'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(gitlabProjectsConn, newEdge)
}

export default handleGitLabCreateIssue
