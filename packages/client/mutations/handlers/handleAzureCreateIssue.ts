import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import SearchQueryId from '~/shared/gqlIds/SearchQueryId'
import type {CreateTaskMutation} from '../../__generated__/CreateTaskMutation.graphql'
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
  const searchQueryId = SearchQueryId.join('azureDevOps', meetingId)
  const searchQueryRecord = store.get(searchQueryId)
  const queryString = (searchQueryRecord?.getValue('queryString') as string | undefined)?.trim()
  const isWIQL = searchQueryRecord?.getValue('isAdvancedQuery') as boolean | undefined
  const projectKeyFilters = searchQueryRecord
    ?.getLinkedRecords('filters')
    ?.filter((filter) => filter.getValue('key') === 'project')
    .map((filter) => filter.getValue('value') as string)
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
