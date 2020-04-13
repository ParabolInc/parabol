import Notification from './Notification'
import {NotificationEnum} from 'parabol-client/lib/types/graphql'

interface Input {
  orgId: string
  userId: string
}

export default class NotificationPromoteToBillingLeader extends Notification {
  orgId: string

  constructor(input: Input) {
    const {orgId, userId} = input
    super({userId, type: NotificationEnum.PROMOTE_TO_BILLING_LEADER})
    this.orgId = orgId
  }
}
