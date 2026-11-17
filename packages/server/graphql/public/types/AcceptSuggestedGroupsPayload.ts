import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {AcceptSuggestedGroupsPayloadResolvers} from '../resolverTypes'

export type AcceptSuggestedGroupsPayloadSource = {
  meetingId: string
  acceptedCount: number
}

const AcceptSuggestedGroupsPayload: AcceptSuggestedGroupsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default AcceptSuggestedGroupsPayload
