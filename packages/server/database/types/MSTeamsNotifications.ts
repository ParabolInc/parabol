import generateUID from '../../generateUID'

export const MSTeamsNotificationEventTypeLookup = {
  meetingStart: 'team',
  meetingEnd: 'team'
  // MEETING_STAGE_TIME_LIMIT_END: 'member',
  // MEETING_STAGE_TIME_LIMIT_START: 'team'
} as const

export type MSTeamsNotificationEvent = keyof typeof MSTeamsNotificationEventTypeLookup
export type MSTeamsNotificationEventEnum = 'meetingEnd' | 'meetingStart'
| 'MEETING_STAGE_TIME_LIMIT_END'
| 'MEETING_STAGE_TIME_LIMIT_START'

interface Input {
  event: MSTeamsNotificationEvent
  channelId: string | null | undefined
  teamId: string
  userId: string
  id?: string
}

export default class MSTeamsNotification {
  id: string
  event: MSTeamsNotificationEvent
  channelId: string | null
  teamId: string
  userId: string

  constructor(input: Input) {
    const {event, channelId, teamId, userId, id} = input
    this.id = id || generateUID()
    this.event = event
    this.channelId = channelId || null
    this.teamId = teamId
    this.userId = userId
  }
}
