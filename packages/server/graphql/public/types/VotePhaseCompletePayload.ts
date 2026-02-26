import type {VotePhaseCompletePayloadResolvers} from '../resolverTypes'

export type VotePhaseCompletePayloadSource = {
  meetingId: string
}

const VotePhaseCompletePayload: VotePhaseCompletePayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default VotePhaseCompletePayload
