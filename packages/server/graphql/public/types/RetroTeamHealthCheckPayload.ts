import {GraphQLError} from 'graphql'
import type {RetroTeamHealthCheckPayloadResolvers} from '../resolverTypes'

export type RetroTeamHealthCheckPayloadSource = {
  meetingId: string
}

const RetroTeamHealthCheckPayload: RetroTeamHealthCheckPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective') {
      throw new GraphQLError('Only a retrospective has Team Health phases', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    }
    return meeting
  }
}

export default RetroTeamHealthCheckPayload
