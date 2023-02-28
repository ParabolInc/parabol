import Notification from './Notification'

interface Input {
  orgId: string
  orgName: string
  orgPicture?: string
  userId: string
}

export default class NotificationTeamsLimitExceeded extends Notification {
  orgId: string
  orgName: string
  orgPicture?: string
  constructor(input: Input) {
    const {userId, orgId, orgName, orgPicture} = input
    super({userId, type: 'TEAMS_LIMIT_EXCEEDED'})
    this.orgId = orgId
    this.orgName = orgName
    this.orgPicture = orgPicture
  }
}
