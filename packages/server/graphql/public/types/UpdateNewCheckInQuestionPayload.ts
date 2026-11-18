import type {UpdateNewCheckInQuestionPayloadResolvers} from '../resolverTypes'

export type UpdateNewCheckInQuestionPayloadSource = {meetingId: string}

const UpdateNewCheckInQuestionPayload: UpdateNewCheckInQuestionPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  }
}

export default UpdateNewCheckInQuestionPayload
