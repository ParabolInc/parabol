import type {AddTranscriptionBotPayloadResolvers} from '../resolverTypes'

export type AddTranscriptionBotPayloadSource = {
  meetingId: string
}

const AddTranscriptionBotPayload: AddTranscriptionBotPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new Error('Meeting type is not retrospective')
    return meeting
  }
}

export default AddTranscriptionBotPayload
