import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutationResponse} from '../../__generated__/CreateTaskMutation.graphql'
import getGitLabProjectsConn from '../connections/getGitLabProjectsConn'
import {gitlabIssueArgs} from './../../components/GitLabScopingSearchResultsRoot'

const handleGitLabCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutationResponse['createTask']['task']>>,
  store: RecordSourceSelectorProxy
) => {
  const integration = task.getLinkedRecord('integration')
  const teamId = task.getValue('teamId')
  const viewer = store.getRoot().getLinkedRecord('viewer')
  const viewerId = viewer?.getValue('id') as string
  const meetingId = task.getValue('meetingId')
  if (!viewerId || !meetingId || !integration) return

  const gitlabSearchQueryId = SearchQueryId.join('gitlab', meetingId)
  const gitlabSearchQuery = store.get(gitlabSearchQueryId)
  const queryString = gitlabSearchQuery?.getValue('queryString') as string | undefined
  const searchQuery = queryString?.trim() ?? ''

  const teamMemberId = toTeamMemberId(teamId, viewerId)
  const teamMember = store.get(teamMemberId)
  const integrations = teamMember?.getLinkedRecord('integrations')
  const gitlab = integrations?.getLinkedRecord('gitlab')
  const typename = integration.getType()
  console.log('🚀  ~ typename', typename)
  if (typename !== '_xGitLabIssue') return
  const selectedProjectsIds = gitlabSearchQuery?.getValue('selectedProjectsIds') as
    | string[]
    | undefined
  const formattedProjectsIds = selectedProjectsIds?.length ? selectedProjectsIds : null
  const gitlabProjectsConn = getGitLabProjectsConn(gitlab, {
    searchQuery,
    projectsIds: formattedProjectsIds,
    state: gitlabIssueArgs.state,
    sort: gitlabIssueArgs.sort
  })
  console.log('🚀  ~ gitlabProjectsConn', {gitlabProjectsConn, integration})
  if (!gitlabProjectsConn) return
  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(
    store,
    gitlabProjectsConn,
    integration,
    '_xGitLabIssue'
  )
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(gitlabProjectsConn, newEdge)
}

export default handleGitLabCreateIssue
