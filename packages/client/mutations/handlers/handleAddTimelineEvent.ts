import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'

const handleAddTimelineEvent = (
  timelineEvent: RecordProxy,
  meeting: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer') as RecordProxy
  if (!viewer) return
  timelineEvent.setLinkedRecord(meeting, 'meeting')
  const timelineConnection = ConnectionHandler.getConnection(
    viewer,
    'TimelineFeedList_timeline'
  ) as RecordProxy
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
