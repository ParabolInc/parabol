import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {parseQueryParams} from '../../utils/useQueryParameterParser'
import getUserTimelineEventsConn from '../connections/getUserTimelineEventsConn'

const handleAddTimelineEvent = (
  meeting: RecordProxy,
  timelineEvent: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !meeting || !timelineEvent) return
  timelineEvent.setLinkedRecord(meeting, 'meeting')
  const {teamIds, eventTypes, showArchived} = parseQueryParams(viewer.getDataID(), window.location)
  const timelineConnection = getUserTimelineEventsConn(
    viewer,
    null,
    teamIds,
    eventTypes,
    showArchived
  )
  if (timelineConnection) {
    const newEdge = ConnectionHandler.createEdge(
      store,
      timelineConnection,
      timelineEvent,
      'TimelineEventEdge'
    )
    newEdge.setValue(meeting.getValue('endedAt'), 'cursor')
    ConnectionHandler.insertEdgeBefore(timelineConnection, newEdge)
  }
}

export default handleAddTimelineEvent
