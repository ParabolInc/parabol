import {ResetReflectionGroupsSuccessResolvers} from '../resolverTypes'
import MeetingRetrospective from '../../../database/types/MeetingRetrospective'

export type ResetReflectionGroupsSuccessSource = {
  meetingId: string
}

const ResetReflectionGroupsSuccess: ResetReflectionGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as MeetingRetrospective
  }
}

export default ResetReflectionGroupsSuccess
