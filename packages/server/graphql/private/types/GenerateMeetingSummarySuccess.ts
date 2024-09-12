import isValid from '../../isValid'
import {GenerateMeetingSummarySuccessResolvers} from '../resolverTypes'

export type GenerateMeetingSummarySuccessSource = {
  meetingIds: string[]
}

const GenerateMeetingSummarySuccess: GenerateMeetingSummarySuccessResolvers = {
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').loadMany(meetingIds))
      .filter(isValid)
      .filter((m) => m.meetingType === 'retrospective')
  }
}

export default GenerateMeetingSummarySuccess
