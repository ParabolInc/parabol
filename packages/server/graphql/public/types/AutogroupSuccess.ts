import MeetingRetrospective from '../../../database/types/MeetingRetrospective'
import {AutogroupSuccessResolvers} from '../resolverTypes'

export type AutogroupSuccessSource = {
  meetingId: string
}

const AutogroupSuccess: AutogroupSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingRetrospective
  }
}

export default AutogroupSuccess
