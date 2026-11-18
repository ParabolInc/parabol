import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {EndSprintPokerPayloadResolvers} from '../resolverTypes'

export type EndSprintPokerPayloadSource = {
  meetingId: string
  teamId: string
  isKill: boolean
  removedTaskIds: string[]
}

const EndSprintPokerPayload: EndSprintPokerPayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },
  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'POKER_COMPLETE' && event.userId === viewerId
    )
    if (!timelineEvent)
      throw new GraphQLError('Timeline event not found', {extensions: {code: 'NOT_FOUND'}})
    return timelineEvent
  }
}

export default EndSprintPokerPayload
