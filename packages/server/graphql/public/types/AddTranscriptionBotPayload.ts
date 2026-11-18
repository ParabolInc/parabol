import {GraphQLError} from 'graphql'
import type {AddTranscriptionBotPayloadResolvers} from '../resolverTypes'

export type AddTranscriptionBotPayloadSource = {
  meetingId: string
}

const AddTranscriptionBotPayload: AddTranscriptionBotPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new GraphQLError('Meeting type is not retrospective', {
        extensions: {code: 'INTERNAL_SERVER_ERROR'}
      })
    return meeting
  }
}

export default AddTranscriptionBotPayload
