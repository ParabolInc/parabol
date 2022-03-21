import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '../../shared/gqlIds/SearchQueryId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutationResponse} from '../../__generated__/CreateTaskMutation.graphql'
import getGitLabProjectsConn from '../connections/getGitLabProjectsConn'

const handleGitLabCreateIssue = (
  task: RecordProxy<NonNullable<CreateTaskMutationResponse['createTask']['task']>>,
  store: RecordSourceSelectorProxy
) => {
  const integration = task.getLinkedRecord('integration')
  // const testIssues = integration.getLinkedRecords('issues')
  // const testProjects = integration.getLinkedRecords('projects')
  // const testId = testIssues?.[0]?.getValue('id')
  // const testTitle = testIssues?.[0]?.getValue('title')
  // console.log('🚀  ~ handleGitLabCreateIssue start', {
  //   testId,
  //   testTitle,
  //   integration,
  //   testIssues,
  //   testProjects
  // })
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
  // const gitlabSearchQueryId = SearchQueryId.join('gitlab', meetingId)
  // const gitlabSearchQuery = store.get(gitlabSearchQueryId)
  // const queryString = gitlabSearchQuery?.getValue('queryString') as string | undefined
  // const query = queryString?.trim() ?? ''
  // const projectsTestOne = gitlab?.getLinkedRecords('projects', {membership: true})
  // const projectsTestTwo = gitlab?.getLinkedRecords('projects', {
  //   membership: true,
  //   first: 20,
  //   sort: 'latest_activity_desc'
  // })
  console.log('🚀  ~ gitlab----', {integrations, gitlab})
  const typeTest = gitlab?.getType()
  // const projectsTesta = gitlab?.getLinkedRecords('projects', {membership: true})
  console.log('🚀  ~ typeTest', typeTest)

  // const firstProject = gitlab && gitlab[0]
  // console.log('🚀  ~ firstProject', {gitlab, projectsTestOne})
  // const node = firstProject?.getLinkedRecord('node')
  // console.log('🚀  ~ node', node)
  // const issues = node?.getLinkedRecords('issues')
  // console.log('🚀  ~ issues', issues)

  const typename = integration.getType()
  console.log('🚀  ~ typename', {typename, gitlab})
  // if (typename !== '_xGitLabIssue') return
  const gitlabProjectsConn = getGitLabProjectsConn(gitlab, '') // TODO: add query string
  console.log('🚀  ~ gitlabProjectsConn', gitlabProjectsConn)
  if (!gitlabProjectsConn) return
  const now = new Date().toISOString()
  // const newEdge = ConnectionHandler.createEdge(
  //   store,
  //   gitlabProjectsConn,
  //   integration,
  //   'GitLabProjectEdge'
  // )
  const newEdge = ConnectionHandler.createEdge(
    store,
    gitlabProjectsConn,
    integration,
    'GitLabIssueEdge'
  )
  newEdge.setValue(now, 'cursor')
  console.log('🚀  ~ end of create issue', {integration, newEdge})
  ConnectionHandler.insertEdgeBefore(gitlabProjectsConn, newEdge)
}

export default handleGitLabCreateIssue
