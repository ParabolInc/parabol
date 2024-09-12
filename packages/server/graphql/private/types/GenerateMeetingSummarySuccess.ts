import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import isValid from '../../isValid'
import {GenerateMeetingSummarySuccessResolvers} from '../resolverTypes'

export type GenerateMeetingSummarySuccessSource = {
  meetingIds: string[]
}

const GenerateMeetingSummarySuccess: GenerateMeetingSummarySuccessResolvers = {
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    const meetings = (await dataLoader.get('newMeetings').loadMany(meetingIds)).filter(isValid)
    return meetings.filter((m) => m.meetingType === 'retrospective') as RetrospectiveMeeting[]
  }
}

export default GenerateMeetingSummarySuccess
