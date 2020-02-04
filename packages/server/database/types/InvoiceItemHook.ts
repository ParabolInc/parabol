import shortid from 'shortid'
import {InvoiceItemType} from 'parabol-client/types/constEnums'

interface Input {
  id?: string
  stripeSubscriptionId: string
  prorationDate: number | false
  quantity: number
  type: InvoiceItemType
  userId: string
}

export default class InvoiceItemHook {
  id: string
  stripeSubscriptionId: string | null
  prorationDate: number | false
  quantity: number
  type: InvoiceItemType
  userId: string

  constructor(input: Input) {
    const {id, quantity, userId, type, prorationDate, stripeSubscriptionId} = input
    this.id = id || shortid.generate()
    this.quantity = quantity
    this.userId = userId
    this.type = type
    this.prorationDate = prorationDate
    this.stripeSubscriptionId = stripeSubscriptionId
  }
}
