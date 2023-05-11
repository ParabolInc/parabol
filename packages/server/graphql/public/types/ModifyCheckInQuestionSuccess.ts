import {ModifyCheckInQuestionSuccessResolvers} from '../resolverTypes'

export type ModifyCheckInQuestionSuccessSource = {
  meetingId: string
}

const ModifyCheckInQuestionSuccess: ModifyCheckInQuestionSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default ModifyCheckInQuestionSuccess
