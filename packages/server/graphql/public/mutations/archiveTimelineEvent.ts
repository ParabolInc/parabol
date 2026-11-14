import {GraphQLError} from 'graphql'
import {SubscriptionChannel} from 'parabol-client/types/constEnums'
import type {TimelineEventEnum} from '../../../database/types/TimelineEvent'
import type TimelineEventCheckinComplete from '../../../database/types/TimelineEventCheckinComplete'
import type TimelineEventPokerComplete from '../../../database/types/TimelineEventPokerComplete'
import type TimelineEventRetroComplete from '../../../database/types/TimelineEventRetroComplete'
import type TimelineEventTeamPromptComplete from '../../../database/types/TimelineEventTeamPromptComplete'
import getKysely from '../../../postgres/getKysely'
import {isTeamMember} from '../../../utils/authorization'
import publish from '../../../utils/publish'
import type {MutationResolvers} from '../resolverTypes'

const archiveTimelineEvent: MutationResolvers['archiveTimelineEvent'] = async (
  _source,
  {timelineEventId},
  context
) => {
  const {authToken, dataLoader, socketId: mutatorId} = context
  const operationId = dataLoader.share()
  const subOptions = {mutatorId, operationId}

  // VALIDATION
  const timelineEvent = await dataLoader.get('timelineEvents').load(timelineEventId)
  if (!timelineEvent) {
    throw new GraphQLError('Timeline Event not found', {extensions: {code: 'NOT_FOUND'}})
  }

  const {isActive, type} = timelineEvent
  if (!isActive) {
    throw new GraphQLError('Timeline Event not found', {extensions: {code: 'NOT_FOUND'}})
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
      throw new GraphQLError('Team not found', {extensions: {code: 'NOT_FOUND'}})
    }
    if (context.resourceGrants && !(await context.resourceGrants.hasTeam(teamId))) {
      throw new GraphQLError('PAT does not grant access to this team', {
        extensions: {code: 'FORBIDDEN'}
      })
    }
    const meetingTimelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const eventIds = meetingTimelineEvents.map(({id}) => id)
    const pg = getKysely()
    await pg
      .updateTable('TimelineEvent')
      .set({isActive: false})
      .where('id', 'in', eventIds)
      .execute()
    meetingTimelineEvents.forEach((event) => {
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

export default archiveTimelineEvent
