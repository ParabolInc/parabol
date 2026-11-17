import type {RetrospectiveMeeting as RetrospectiveMeetingDB} from '../../../postgres/types/Meeting'
import type {UngroupReflectionPayloadResolvers} from '../resolverTypes'

export type UngroupReflectionPayloadSource = {
  meetingId: string
}

const UngroupReflectionPayload: UngroupReflectionPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeetingDB
  }
}

export default UngroupReflectionPayload
