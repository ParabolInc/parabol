import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {EndTeamHealthPayloadResolvers} from '../resolverTypes'

export type EndTeamHealthPayloadSource = {
  meetingId: string
  teamId: string
}

const EndTeamHealthPayload: EndTeamHealthPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'teamHealth')
      throw new GraphQLError('Meeting is not a team health', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  },
  team: async ({teamId}, _args, {dataLoader}) => {
    return await dataLoader.get('teams').loadNonNull(teamId)
  },
  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'TEAM_HEALTH_COMPLETE' && event.userId === viewerId
    )
    if (!timelineEvent)
      throw new GraphQLError('Timeline event not found', {extensions: {code: 'NOT_FOUND'}})
    return await dataLoader.get('timelineEvents').loadNonNull(timelineEvent.id)
  }
}

export default EndTeamHealthPayload
