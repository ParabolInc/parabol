import generateUID from '../../generateUID'

export const slackNotificationEventTypeLookup = {
  meetingStart: 'team' as const,
  meetingEnd: 'team' as const,
  MEETING_STAGE_TIME_LIMIT_END: 'member' as const,
  MEETING_STAGE_TIME_LIMIT_START: 'team' as const
}

export type SlackNotificationEvent = keyof typeof slackNotificationEventTypeLookup

interface Input {
  event: SlackNotificationEvent
  channelId: string | null | undefined
  // channelName: string
  teamId: string
  userId: string
  id?: string
}

export default class SlackNotification {
  id: string
  event: SlackNotificationEvent
  channelId: string | null
  // channelName: string
  teamId: string
  userId: string

  constructor(input: Input) {
    const {event, channelId, teamId, userId, id} = input
    this.id = id || generateUID()
    this.event = event
    this.channelId = channelId || null
    // this.channelName = channelName
    this.teamId = teamId
    this.userId = userId
  }
}
