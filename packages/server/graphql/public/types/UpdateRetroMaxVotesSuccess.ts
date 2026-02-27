import type {UpdateRetroMaxVotesSuccessResolvers} from '../resolverTypes'

export type UpdateRetroMaxVotesSuccessSource = {
  meetingId: string
}

const UpdateRetroMaxVotesSuccess: UpdateRetroMaxVotesSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default UpdateRetroMaxVotesSuccess
