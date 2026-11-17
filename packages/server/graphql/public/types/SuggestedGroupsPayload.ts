import type {RetrospectiveMeeting} from '../../../postgres/types/Meeting'
import type {SuggestedGroupsPayloadResolvers} from '../resolverTypes'

export type SuggestedGroupsPayloadSource = {
  meetingId: string
  isUserInitiated: boolean
}

const SuggestedGroupsPayload: SuggestedGroupsPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    const meeting = await dataLoader.get('newMeetings').loadNonNull(meetingId)
    return meeting as RetrospectiveMeeting
  }
}

export default SuggestedGroupsPayload
