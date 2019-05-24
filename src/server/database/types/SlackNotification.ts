import shortid from 'shortid'

type SlackNotificationEvent = 'meetingStart' | 'meetingEnd'

interface Input {
  event: SlackNotificationEvent
  channelId: string | null
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
    this.channelId = channelId
    // this.channelName = channelName
    this.teamId = teamId
    this.userId = userId
  }
}
