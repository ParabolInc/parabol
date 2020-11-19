import {ConnectionHandler, RecordProxy, RecordSourceSelectorProxy} from 'relay-runtime'
import {insertNodeBeforeInConn} from '~/utils/relay/insertNode'

const handleAddTimelineEvent = (
  meeting: RecordProxy,
  timelineEvent: RecordProxy,
  store: RecordSourceSelectorProxy
) => {
  const viewer = store.getRoot().getLinkedRecord('viewer')
  if (!viewer || !meeting || !timelineEvent) return
  timelineEvent.setLinkedRecord(meeting, 'meeting')
  const timelineConn = ConnectionHandler.getConnection(viewer, 'TimelineFeedList_timeline')
  if (!timelineConn) return
  const cursorValue = meeting.getValue('endedAt') as string
  insertNodeBeforeInConn(timelineConn, timelineEvent, store, 'TimelineEventEdge', cursorValue)
}

export default handleAddTimelineEvent
