import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import {GenerateGroupsSuccessResolvers} from '../resolverTypes'

export type GenerateGroupsSuccessSource = {
  meetingId: string
}

const GenerateGroupsSuccess: GenerateGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default GenerateGroupsSuccess
