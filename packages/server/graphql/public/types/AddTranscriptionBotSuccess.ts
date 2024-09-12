import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import {AddTranscriptionBotSuccessResolvers} from '../resolverTypes'

export type AddTranscriptionBotSuccessSource = {
  meetingId: string
}

const AddTranscriptionBotSuccess: AddTranscriptionBotSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default AddTranscriptionBotSuccess
