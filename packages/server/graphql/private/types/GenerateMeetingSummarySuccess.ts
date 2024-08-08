import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {GenerateMeetingSummarySuccessResolvers} from '../resolverTypes'

export type GenerateMeetingSummarySuccessSource = {
  meetingIds: string[]
}

const GenerateMeetingSummarySuccess: GenerateMeetingSummarySuccessResolvers = {
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    const meetings = (await dataLoader
      .get('newMeetings')
      .loadMany(meetingIds)) as MeetingRetrospective[]
    return meetings
  }
}

export default GenerateMeetingSummarySuccess
