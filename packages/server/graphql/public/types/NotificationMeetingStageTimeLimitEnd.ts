import {NotificationMeetingStageTimeLimitEndResolvers} from '../resolverTypes'

const NotificationMeetingStageTimeLimitEnd: NotificationMeetingStageTimeLimitEndResolvers = {
  __isTypeOf: ({type}) => type === 'MEETING_STAGE_TIME_LIMIT_END',
  meeting: async ({meetingId}, _args, {dataLoader}) => {
    return dataLoader.get('newMeetings').load(meetingId)
  }
}

export default NotificationMeetingStageTimeLimitEnd
