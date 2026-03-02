import type {RenameMeetingSuccessResolvers} from '../resolverTypes'

export type RenameMeetingSuccessSource = {meetingId: string}

const RenameMeetingSuccess: RenameMeetingSuccessResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default RenameMeetingSuccess
