import {SlackNotificationResolvers} from '../resolverTypes'

export const slackNotificationEventTypeLookup = {
  meetingStart: 'team',
  meetingEnd: 'team',
  MEETING_STAGE_TIME_LIMIT_END: 'member',
  MEETING_STAGE_TIME_LIMIT_START: 'team',
  TOPIC_SHARED: 'member',
  STANDUP_RESPONSE_SUBMITTED: 'team'
} as const

const SlackNotification: SlackNotificationResolvers = {
  eventType: ({event}) => {
    return slackNotificationEventTypeLookup[event]
  }
}

export default SlackNotification
