import type {JoinMeetingSuccessResolvers} from '../resolverTypes'

export type JoinMeetingSuccessSource = {
  meetingId: string
}

const JoinMeetingSuccess: JoinMeetingSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default JoinMeetingSuccess
