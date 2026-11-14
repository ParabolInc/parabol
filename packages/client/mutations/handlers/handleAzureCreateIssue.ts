import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import type {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
import {searchFiltersByKey} from '../../integrations/platform/IntegrationSearchFilter'
import readScopingSearchStateFromRelayStore from '../../utils/relay/readScopingSearchStateFromRelayStore'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import getAzureWorkItemsConn from '../connections/getAzureWorkItemsConn'

const handleAzureCreateIssue = (
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
  const azureDevOps = integrations?.getLinkedRecord('azureDevOps')
  const {queryString, isAdvancedQuery, filters} = readScopingSearchStateFromRelayStore(
    store,
    meetingId,
    'azureDevOps'
  )
  const typename = integration.getType()
  if (typename === 'AzureDevOpsWorkItem') {
    const azureWorkItemsConn = getAzureWorkItemsConn(
      azureDevOps,
      isAdvancedQuery,
      queryString.trim(),
      searchFiltersByKey(filters, 'project')
    )
    if (!azureWorkItemsConn) return
    const now = new Date().toISOString()
    const newEdge = ConnectionHandler.createEdge(
      store,
      azureWorkItemsConn,
      integration,
      'AzureWorkItemEdge'
    )
    newEdge.setValue(now, 'cursor')
    ConnectionHandler.insertEdgeBefore(azureWorkItemsConn, newEdge)
  }
}

export default handleAzureCreateIssue
