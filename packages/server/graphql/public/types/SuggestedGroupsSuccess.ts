import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {SuggestedGroupsSuccessResolvers} from '../resolverTypes'

export type SuggestedGroupsSuccessSource = {
  meetingId: string
  isUserInitiated: boolean
}

const SuggestedGroupsSuccess: SuggestedGroupsSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default SuggestedGroupsSuccess
