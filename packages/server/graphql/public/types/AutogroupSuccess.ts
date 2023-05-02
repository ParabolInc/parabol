import {AutogroupSuccessResolvers} from '../resolverTypes'

export type AutogroupSuccessSource = {
  meetingId: string
}

const AutogroupSuccess: AutogroupSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default AutogroupSuccess
