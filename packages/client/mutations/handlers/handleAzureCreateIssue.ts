import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import toTeamMemberId from '../../utils/relay/toTeamMemberId'
import {CreateTaskMutationResponse} from '../../__generated__/CreateTaskMutation.graphql'
import getAzureWorkItemsConn from '../connections/getAzureWorkItemsConn'

const handleAzureCreateIssue = (
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
  const azureDevOps = integrations?.getLinkedRecord('azureDevOps')
  const azureSearchQueryId = SearchQueryId.join('azureDevOps', meetingId)
  const azureSearchQuery = store.get(azureSearchQueryId)
  const queryString = azureSearchQuery?.getValue('queryString') as string | undefined
  const isWIQL = azureSearchQuery?.getValue('isWIQL') as boolean | undefined
  const projectKeyFilters = azureSearchQuery?.getValue('projectKeyFilters') as string[] | undefined
  const typename = integration.getType()
  if (typename === 'AzureDevOpsWorkItem') {
    const azureWorkItemsConn = getAzureWorkItemsConn(
      azureDevOps,
      isWIQL,
      queryString,
      projectKeyFilters
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
