import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import {makeLinearIssueFilter} from '~/utils/makeLinearIssueFilter'
import {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import getLinearIssuesConn from '../connections/getLinearIssuesConn'

const handleLinearCreateIssue = (
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
  const linear = integrations
    ?.getLinkedRecord('linear')
    ?.getLinkedRecord('api')
    ?.getLinkedRecord('query')
  const linearSearchQueryId = SearchQueryId.join('linear', meetingId)
  const linearSearchQuery = store.get(linearSearchQueryId)
  const queryString =
    (linearSearchQuery?.getValue('queryString') as string | undefined)?.trim() ?? ''
  const selectedProjectsIds =
    (linearSearchQuery?.getValue('selectedProjectsIds') as string[] | undefined) ?? []
  const typename = integration.getType()
  if (typename !== '_xLinearIssue') return
  const filter = makeLinearIssueFilter(queryString, selectedProjectsIds)
  const linearIssueConn = getLinearIssuesConn(linear, {filter})
  if (!linearIssueConn) return

  const now = new Date().toISOString()
  const newEdge = ConnectionHandler.createEdge(store, linearIssueConn, integration, '_xLinearIssue')
  newEdge.setValue(now, 'cursor')
  ConnectionHandler.insertEdgeBefore(linearIssueConn, newEdge)
}

export default handleLinearCreateIssue
