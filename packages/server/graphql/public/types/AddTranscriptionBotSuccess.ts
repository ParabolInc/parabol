import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  meetingId: string
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingRetrospective
  }
}

export default AddTranscriptionBotSuccess
