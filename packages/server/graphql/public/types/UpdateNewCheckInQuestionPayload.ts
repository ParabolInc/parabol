import type {UpdateNewCheckInQuestionPayloadResolvers} from '../resolverTypes'

export type UpdateNewCheckInQuestionPayloadSource = {meetingId: string} | {error: {message: string}}

const UpdateNewCheckInQuestionPayload: UpdateNewCheckInQuestionPayloadResolvers = {
  meeting: (source, _args, {dataLoader}) => {
    if ('error' in source) return null
    return dataLoader.get('newMeetings').loadNonNull(source.meetingId)
  }
}

export default UpdateNewCheckInQuestionPayload
