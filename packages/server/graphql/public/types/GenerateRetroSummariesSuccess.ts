import isValid from '../../isValid'
import {GenerateRetroSummariesSuccessResolvers} from '../resolverTypes'

export type GenerateRetroSummariesSuccessSource = {
  meetingIds: string[]
}

const GenerateRetroSummariesSuccess: GenerateRetroSummariesSuccessResolvers = {
  meetings: async ({meetingIds}, _args, {dataLoader}) => {
    return (await dataLoader.get('newMeetings').loadMany(meetingIds))
      .filter(isValid)
      .filter((m) => m.meetingType === 'retrospective')
  }
}

export default GenerateRetroSummariesSuccess
