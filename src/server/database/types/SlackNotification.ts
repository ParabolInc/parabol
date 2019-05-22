import shortid from 'shortid'

type SlackNotificationEvent = 'meetingStart' | 'meetingEnd'

export default class SlackNotification {
  id = shortid.generate()
  isActive = true

  constructor (
    public event: SlackNotificationEvent,
    public channelId: string,
    public teamId: string,
    public userId: string
  ) {}
}
