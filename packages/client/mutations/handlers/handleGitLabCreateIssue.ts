import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import {gitLabIssueArgs} from '~/integrations/gitlab/gitLabIssueArgs'
import type {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
import {searchFiltersByKey} from '../../integrations/platform/IntegrationSearchFilter'
import readScopingSearchStateFromRelayStore from '../../utils/relay/readScopingSearchStateFromRelayStore'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import getGitLabProjectsIssuesConn from '../connections/getGitLabProjectsIssuesConn'

const handleGitLabCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutation['response']['createTask']['task']>>,
  store: RecordSourceSelectorProxy
) => {
  const integration = task.getLinkedRecord('integration')
  const teamId = task.getValue('teamId')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer?.getValue('id') as string
  const meetingId = task.getValue('meetingId')
  if (!viewerId || !meetingId || !integration) return

  const {queryString, filters} = readScopingSearchStateFromRelayStore(store, meetingId, 'gitlab')

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = store.get(teamMemberId)
  const integrations = teamMember?.getLinkedRecord('integrations')
  const gitlab = integrations?.getLinkedRecord('gitlab')
  const typename = integration.getType()
  if (typename !== '_xGitLabIssue') return
  const selectedProjectsIds = searchFiltersByKey(filters, 'project')
  const formattedProjectsIds = selectedProjectsIds.length ? selectedProjectsIds : null
  const gitlabProjectsIssuesConn = getGitLabProjectsIssuesConn(gitlab, {
    searchQuery: queryString.trim(),
    projectsIds: formattedProjectsIds,
    ...gitLabIssueArgs
  })
  if (!gitlabProjectsIssuesConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    gitlabProjectsIssuesConn,
    integration,
    '_xGitLabIssue'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(gitlabProjectsIssuesConn, newEdge)
}

export default handleGitLabCreateIssue
