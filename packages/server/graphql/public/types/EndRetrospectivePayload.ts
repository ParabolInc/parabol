import {GraphQLError} from 'graphql'
import {getUserId} from '../../../utils/authorization'
import type {EndRetrospectivePayloadResolvers} from '../resolverTypes'

export type EndRetrospectivePayloadSource = {
  meetingId: string
  teamId: string
  isKill: boolean
  removedTaskIds: string[]
  updatedTaskIds: string[]
}

const EndRetrospectivePayload: EndRetrospectivePayloadResolvers = {
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  },

  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  },

  timelineEvent: async ({meetingId}, _args, {dataLoader, authToken}) => {
    const viewerId = getUserId(authToken)
    const timelineEvents = await dataLoader.get('timelineEventsByMeetingId').load(meetingId)
    const timelineEvent = timelineEvents.find(
      (event) => event.type === 'retroComplete' && event.userId === viewerId
    )
    if (!timelineEvent)
      throw new GraphQLError('Timeline event not found', {extensions: {code: 'NOT_FOUND'}})
    return timelineEvent as typeof timelineEvent & {meetingId: string}
  }
}

export default EndRetrospectivePayload
