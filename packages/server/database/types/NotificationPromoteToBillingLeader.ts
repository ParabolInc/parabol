import Notification from './Notification'

interface Input {
  orgId: string
  userId: string
}

export default class NotificationPromoteToBillingLeader extends Notification {
  readonly type = 'PROMOTE_TO_BILLING_LEADER'
  orgId: string

  constructor(input: Input) {
    const {orgId, userId} = input
    super({userId, type: 'PROMOTE_TO_BILLING_LEADER'})
    this.orgId = orgId
  }
}
