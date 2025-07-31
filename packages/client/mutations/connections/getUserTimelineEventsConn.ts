import {ConnectionHandler, type ReadOnlyRecordProxy} from 'relay-runtime'
import type {TimelineEventEnum} from '../../__generated__/TimelineFeedListPaginationQuery.graphql'

const getUserTimelineEventsConn = (
  viewer: ReadOnlyRecordProxy,
  userIds: string[] | null,
  teamIds: string[] | null,
  eventTypes: TimelineEventEnum[] | null,
  showArchived: boolean
) =>
  ConnectionHandler.getConnection(viewer, 'TimelineFeedList_timeline', {
    userIds,
    teamIds,
    eventTypes,
    archived: showArchived
  })

export default getUserTimelineEventsConn
