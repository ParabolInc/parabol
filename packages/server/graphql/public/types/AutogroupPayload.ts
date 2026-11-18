import {GraphQLError} from 'graphql'
import type {AutogroupPayloadResolvers} from '../resolverTypes'

export type AutogroupPayloadSource = {
  meetingId: string
}

const AutogroupPayload: AutogroupPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new GraphQLError('Not a retrospective meeting', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  }
}

export default AutogroupPayload
