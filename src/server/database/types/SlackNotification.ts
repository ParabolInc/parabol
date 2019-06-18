import shortid from 'shortid'

export const slackNotificationEventTypeLookup = {
  meetingStart: 'team' as 'team',
  meetingEnd: 'team' as 'team',
  MEETING_STAGE_TIME_LIMIT: 'team' as 'team',
  meetingNextStageReady: 'member' as 'member'
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

  constructor (input: Input) {
    const {event, channelId, teamId, userId, id} = input
    this.id = id || shortid.generate()
    this.event = event
    this.channelId = channelId || null
    // this.channelName = channelName
    this.teamId = teamId
    this.userId = userId
  }
}
