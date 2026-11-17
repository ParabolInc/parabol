import type {ResetRetroMeetingToGroupStagePayloadResolvers} from '../resolverTypes'

export type ResetRetroMeetingToGroupStagePayloadSource = {meetingId: string}

const ResetRetroMeetingToGroupStagePayload: ResetRetroMeetingToGroupStagePayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  }
}

export default ResetRetroMeetingToGroupStagePayload
