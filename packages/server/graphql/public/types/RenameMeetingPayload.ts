import type {RenameMeetingPayloadResolvers} from '../resolverTypes'

export type RenameMeetingPayloadSource = {meetingId: string}

const RenameMeetingPayload: RenameMeetingPayloadResolvers = {
  meeting: ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default RenameMeetingPayload
