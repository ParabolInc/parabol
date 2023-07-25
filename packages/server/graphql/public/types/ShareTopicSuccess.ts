import {ShareTopicSuccessResolvers} from '../resolverTypes'

export type ShareTopicSuccessSource = {
  meetingId: string
}

const ShareTopicSuccess: ShareTopicSuccessResolvers = {
  meeting: async ({meetingId}, {}, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default ShareTopicSuccess
