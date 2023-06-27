import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
// import {GenerateGroupsSuccessResolvers} from '../resolverTypes'

export type GenerateGroupsSuccessSource = {
  meetingId: string
}

// const GenerateGroupsSuccess: GenerateGroupsSuccessResolvers = {
const GenerateGroupsSuccess = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingRetrospective
  }
}

export default GenerateGroupsSuccess
