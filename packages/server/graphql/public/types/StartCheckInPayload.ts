import {GraphQLError} from 'graphql'
import type {StartCheckInPayloadResolvers} from '../resolverTypes'

export type StartCheckInPayloadSource = {
  meetingId: string
  teamId: string
}

const StartCheckInPayload: StartCheckInPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'action')
      throw new GraphQLError('Not a check-in meeting', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  },
  team: ({teamId}, _args, {dataLoader}) => {
    return dataLoader.get('teams').loadNonNull(teamId)
  }
}

export default StartCheckInPayload
