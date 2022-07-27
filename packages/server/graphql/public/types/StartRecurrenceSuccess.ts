import MeetingTeamPrompt from '../../../database/types/MeetingTeamPrompt'
import {StartRecurrenceSuccessResolvers} from '../resolverTypes'

export type StartRecurrenceSuccessSource = {
  meetingId: string
  meetingSeriesId: string
}

const StartRecurrenceSuccess: StartRecurrenceSuccessResolvers = {
  meeting: async (source, _args, {dataLoader}) => {
    const {meetingId} = source
    return dataLoader.get('newMeetings').load(meetingId) as Promise<MeetingTeamPrompt>
  }
}

export default StartRecurrenceSuccess
