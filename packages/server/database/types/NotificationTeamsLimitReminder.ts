import Notification from './Notification'

interface Input {
  orgId: string
  orgName: string
  orgPicture?: string | null
  userId: string
  scheduledLockAt: Date
}

export default class NotificationTeamsLimitReminder extends Notification {
  readonly type = 'TEAMS_LIMIT_REMINDER'
  orgId: string
  orgName: string
  orgPicture?: string | null
  scheduledLockAt: Date
  constructor(input: Input) {
    const {userId, orgId, orgName, orgPicture, scheduledLockAt} = input
    super({userId, type: 'TEAMS_LIMIT_REMINDER'})
    this.orgId = orgId
    this.scheduledLockAt = scheduledLockAt
    this.orgName = orgName
    this.orgPicture = orgPicture
  }
}
