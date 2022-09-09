import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {StopRecurrenceSuccessResolvers} from '../resolverTypes'

export type StopRecurrenceSuccessSource = {
  meetingId: string
}

const StopRecurrenceSuccess: StopRecurrenceSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingTeamPrompt>
  }
}

export default StopRecurrenceSuccess
