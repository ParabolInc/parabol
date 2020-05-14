import {ConnectionHandler, ReadOnlyRecordProxy} from 'relay-runtime'

const getUserTimelineEventsConn = (viewer: ReadOnlyRecordProxy) =>
  ConnectionHandler.getConnection(viewer, 'TimelineFeedList_timeline')

export default getUserTimelineEventsConn
