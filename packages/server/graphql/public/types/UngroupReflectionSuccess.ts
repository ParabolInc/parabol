import type {RetrospectiveMeeting as RetrospectiveMeetingDB} from '../../../postgres/types/Meeting'
import type {UngroupReflectionSuccessResolvers} from '../resolverTypes'

export type UngroupReflectionSuccessSource = {
  meetingId: string
}

const UngroupReflectionSuccess: UngroupReflectionSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeetingDB
  }
}

export default UngroupReflectionSuccess
