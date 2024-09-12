import {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import {ResetReflectionGroupsSuccessResolvers} from '../resolverTypes'

export type ResetReflectionGroupsSuccessSource = {
  meetingId: string
}

const ResetReflectionGroupsSuccess: ResetReflectionGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').load(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default ResetReflectionGroupsSuccess
