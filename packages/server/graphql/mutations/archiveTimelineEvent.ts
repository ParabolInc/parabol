import {GraphQLID, GraphQLNonNull} from 'graphql'
import getRethink from '../../database/rethinkDriver'
import {GQLContext} from '../graphql'
import ArchiveTimelineEventPayload from '../types/ArchiveTimelineEventPayload'
import publish from '../../utils/publish'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import TimelineEvent from '../../database/types/TimelineEvent'
import {getUserId, isTeamMember} from '../../utils/authorization'
import standardError from '../../utils/standardError'

const archiveTimelineEvent = {
  type: GraphQLNonNull(ArchiveTimelineEventPayload),
  description: `Archive a timeline event`,
  args: {
    timelineEventId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the id for the timeline event'
    },
    meetingId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the meeting id for the timeline event'
    },
    teamId: {
      type: GraphQLNonNull(GraphQLID),
      description: 'the team id for the timeline event'
    }
  },
  resolve: async (
    _source,
    {timelineEventId, meetingId, teamId},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const r = await getRethink()
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // AUTH
    if (!isTeamMember(authToken, teamId)) {
      return standardError(new Error('Team not found'), {userId: viewerId})
    }

    // VALIDATION
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    if (!timelineEvents) {
      return {error: {message: 'TimelineEvents not found'}}
    }

    // RESOLUTION
    await Promise.all(
      timelineEvents.map((timelineEvent: TimelineEvent) => {
        timelineEvent.isActive = false
        r.table('TimelineEvent')
          .get(timelineEvent.id)
          .update({
            isActive: false
          })
          .run()
      })
    )

    timelineEvents.map(({id: timelineEventId}) => {
      const data = {timelineEventId}
      publish(SubscriptionChannel.TEAM, teamId, 'ArchiveTimelineEventSuccess', data, subOptions)
    })

    return {timelineEventId}
  }
}

export default archiveTimelineEvent
