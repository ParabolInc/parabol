import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {AcceptSuggestedGroupsSuccessResolvers} from '../resolverTypes'

export type AcceptSuggestedGroupsSuccessSource = {
  meetingId: string
  acceptedCount: number
}

const AcceptSuggestedGroupsSuccess: AcceptSuggestedGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default AcceptSuggestedGroupsSuccess
