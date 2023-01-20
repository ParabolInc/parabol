import Notification from './Notification'

interface Input {
  orgId: string
  userId: string
  scheduledLockAt: Date
}

export default class NotificationTeamsLimitExceeded extends Notification {
  orgId: string
  scheduledLockAt: Date
  constructor(input: Input) {
    const {userId, orgId, scheduledLockAt} = input
    super({userId, type: 'TEAMS_LIMIT_REMINDER'})
    this.orgId = orgId
    this.scheduledLockAt = scheduledLockAt
  }
}
