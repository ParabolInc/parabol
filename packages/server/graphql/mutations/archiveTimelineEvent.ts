import {GraphQLID, GraphQLNonNull} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import {TimelineEventEnum} from '../../database/types/TimelineEvent'
import TimelineEventCheckinComplete from '../../database/types/TimelineEventCheckinComplete'
import TimelineEventPokerComplete from '../../database/types/TimelineEventPokerComplete'
import TimelineEventRetroComplete from '../../database/types/TimelineEventRetroComplete'
import TimelineEventTeamPromptComplete from '../../database/types/TimelineEventTeamPromptComplete'
import getKysely from '../../postgres/getKysely'
import {getUserId, isTeamMember} from '../../utils/authorization'
import publish from '../../utils/publish'
import standardError from '../../utils/standardError'
import {GQLContext} from '../graphql'
import ArchiveTimelineEventPayload from '../types/ArchiveTimelineEventPayload'

const archiveTimelineEvent = {
  type: new GraphQLNonNull(ArchiveTimelineEventPayload),
  description: `Archive a timeline event`,
  args: {
    timelineEventId: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'the id for the timeline event'
    }
  },
  resolve: async (
    _source: unknown,
    {timelineEventId}: {timelineEventId: string},
    {authToken, dataLoader, socketId: mutatorId}: GQLContext
  ) => {
    const operationId = dataLoader.share()
    const subOptions = {mutatorId, operationId}
    const viewerId = getUserId(authToken)

    // VALIDATION
    const timelineEvent = await dataLoader.get('timelineEvents').load(timelineEventId)
    if (!timelineEvent) {
      return {error: {message: 'Timeline Event not found'}}
    }

    const {isActive, type} = timelineEvent
    if (!isActive) {
      return {error: {message: 'Timeline Event not found'}}
    }

    const meetingTypes: TimelineEventEnum[] = [
      'actionComplete',
      'retroComplete',
      'POKER_COMPLETE',
      'TEAM_PROMPT_COMPLETE'
    ]
    if (meetingTypes.includes(type)) {
      // it's a meeting timeline event, archive it for everyone
      const {teamId, meetingId} = timelineEvent as
        | TimelineEventCheckinComplete
        | TimelineEventRetroComplete
        | TimelineEventPokerComplete
        | TimelineEventTeamPromptComplete
      if (!isTeamMember(authToken, teamId)) {
        return standardError(new Error('Team not found'), {userId: viewerId})
      }
      const meetingTimelineEvents = await dataLoader
        .get('timelineEventsByMeetingId')
        .load(meetingId)
      const eventIds = meetingTimelineEvents.map(({id}) => id)
      const pg = getKysely()
      await pg
        .updateTable('TimelineEvent')
        .set({isActive: false})
        .where('id', 'in', eventIds)
        .execute()
      meetingTimelineEvents.map((event) => {
        const {id: timelineEventId, userId} = event
        publish(
          SubscriptionChannel.NOTIFICATION,
          userId,
          'ArchiveTimelineEventSuccess',
          {timelineEventId},
          subOptions
        )
      })
    }
    return {timelineEventId}
  }
}

export default archiveTimelineEvent
