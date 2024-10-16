import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  meetingId: string
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    if (meeting.meetingType !== 'retrospective')
      throw new Error('Meeting type is not retrospective')
    return meeting
  }
}

export default AddTranscriptionBotSuccess
