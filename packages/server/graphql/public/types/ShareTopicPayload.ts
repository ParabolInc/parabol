import type {ShareTopicPayloadResolvers} from '../resolverTypes'

export type ShareTopicPayloadSource = {
  meetingId: string
}

const ShareTopicPayload: ShareTopicPayloadResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').loadNonNull(meetingId)
  }
}

export default ShareTopicPayload
