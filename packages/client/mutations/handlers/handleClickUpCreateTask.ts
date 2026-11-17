import {ConnectionHandler, type RecordProxy, type RecordSourceSelectorProxy} from 'relay-runtime'
import {searchFiltersByKey} from '../../integrations/platform/IntegrationSearchFilter'
import TeamMemberId from '../../shared/gqlIds/TeamMemberId'
import readScopingSearchStateFromRelayStore from '../../utils/relay/readScopingSearchStateFromRelayStore'
import getClickUpTasksConn from '../connections/getClickUpTasksConn'

const handleClickUpCreateTask = (task: RecordProxy, store: RecordSourceSelectorProxy) => {
  const integration = task.getLinkedRecord('integration')
  if (integration?.getType() !== 'ClickUpTask') return
  const teamId = task.getValue('teamId')
  const meetingId = task.getValue('meetingId')
  const viewerId = store.getRoot().getLinkedRecord('viewer')?.getValue('id')
  if (typeof teamId !== 'string' || typeof meetingId !== 'string' || typeof viewerId !== 'string') {
    return
  }
  const clickUp = store
    .get(TeamMemberId.join(teamId, viewerId))
    ?.getLinkedRecord('integrations')
    ?.getLinkedRecord('clickup')
  const {queryString, filters} = readScopingSearchStateFromRelayStore(store, meetingId, 'clickup')
  const tasksConn = getClickUpTasksConn(
    clickUp,
    queryString.trim(),
    searchFiltersByKey(filters, 'listIds')
  )
  if (!tasksConn) return
  const newEdge = ConnectionHandler.createEdge(store, tasksConn, integration, 'ClickUpTaskEdge')
  newEdge.setValue(null, 'cursor')
  ConnectionHandler.insertEdgeBefore(tasksConn, newEdge)
}

export default handleClickUpCreateTask
