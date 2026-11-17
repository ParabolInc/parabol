import type {UpdateRetroMaxVotesPayloadResolvers} from '../resolverTypes'

export type UpdateRetroMaxVotesPayloadSource = {
  meetingId: string
}

const UpdateRetroMaxVotesPayload: UpdateRetroMaxVotesPayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateRetroMaxVotesPayload
