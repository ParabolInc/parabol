import {GraphQLError} from 'graphql'
import type {StartRetrospectivePayloadResolvers} from '../resolverTypes'

export type StartRetrospectivePayloadSource = {
  meetingId: string | null
  meetingSeriesId?: number | null
  teamId: string
  hasGcalError?: boolean
}

const StartRetrospectivePayload: StartRetrospectivePayloadResolvers = {
  meeting: async ({meetingId}, _args: unknown, {dataLoader}) => {
    if (!meetingId) return null
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new GraphQLError('Not a retrospective meeting', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  },
  meetingSeries: async ({meetingSeriesId}, _args: unknown, {dataLoader}) => {
    if (!meetingSeriesId) return null
    return (await dataLoader.get('meetingSeries').load(meetingSeriesId)) ?? null
  },
  team: ({teamId}, _args: unknown, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartRetrospectivePayload
