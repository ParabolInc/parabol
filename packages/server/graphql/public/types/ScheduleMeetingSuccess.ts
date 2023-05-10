import {ScheduleMeetingSuccessResolvers} from '../resolverTypes'

export type ScheduleMeetingSuccessSource = {
  meetingId: string
}

const ScheduleMeetingSuccess: ScheduleMeetingSuccessResolvers = {
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default ScheduleMeetingSuccess
