import Notification from './Notification'

interface Input {
  orgId: string
  userId: string
}

export default class NotificationTeamsLimitExceeded extends Notification {
  orgId: string
  constructor(input: Input) {
    const {userId, orgId} = input
    super({userId, type: 'TEAMS_LIMIT_REMINDER'})
    this.orgId = orgId
  }
}
