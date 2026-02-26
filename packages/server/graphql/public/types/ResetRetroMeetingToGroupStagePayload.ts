import type {ResetRetroMeetingToGroupStagePayloadResolvers} from '../resolverTypes'

export type ResetRetroMeetingToGroupStagePayloadSource =
  | {meetingId: string}
  | {error: {message: string}}

const ResetRetroMeetingToGroupStagePayload: ResetRetroMeetingToGroupStagePayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  }
}

export default ResetRetroMeetingToGroupStagePayload
