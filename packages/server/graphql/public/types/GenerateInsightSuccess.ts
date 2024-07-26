import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {GenerateInsightSuccessResolvers} from '../resolverTypes'

export type GenerateInsightSuccessSource = {
  wins: string[]
  challenges: string[]
  meetingIds: string[]
}

const GenerateInsightSuccess: GenerateInsightSuccessResolvers = {
  wins: ({wins}) => wins,
  challenges: ({challenges}) => challenges,
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    const meetings = (await dataLoader
      .get('newMeetings')
      .loadMany(meetingIds)) as MeetingRetrospective[]
    return meetings
  }
}

export default GenerateInsightSuccess
