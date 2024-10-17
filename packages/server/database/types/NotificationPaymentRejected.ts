import Notification from './Notification'

interface Input {
  orgId: string
  last4: string | number
  brand: string
  userId: string
}

export default class NotificationPaymentRejected extends Notification {
  readonly type = 'PAYMENT_REJECTED'
  orgId: string
  last4: number
  brand: string

  constructor(input: Input) {
    const {orgId, last4, brand, userId} = input
    super({userId, type: 'PAYMENT_REJECTED'})
    this.orgId = orgId
    this.last4 = Number(last4)
    this.brand = brand
  }
}
