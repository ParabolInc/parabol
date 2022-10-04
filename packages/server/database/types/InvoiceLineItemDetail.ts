interface Input {
  id: string
  amount: number
  email: string
  endAt?: Date | null
  parentId: string
  startAt?: Date | null
}

export default class InvoiceLineItemDetail {
  id: string
  amount: number
  email: string
  endAt: Date | null
  parentId: string
  startAt: Date | null

  constructor(input: Input) {
    const {amount, id, startAt, endAt, email, parentId} = input
    this.id = id
    this.amount = amount
    this.startAt = startAt || null
    this.email = email
    this.endAt = endAt || null
    this.parentId = parentId
  }
}
