interface Input {
  amount: number
  nextPeriodEnd: Date
  quantity: number
  unitPrice: number
}

export default class InvoiceChargeNextMonth {
  amount: number
  nextPeriodEnd: Date
  quantity: number
  unitPrice: number

  constructor (input: Input) {
    const {amount, nextPeriodEnd, quantity, unitPrice} = input
    this.amount = amount
    this.nextPeriodEnd = nextPeriodEnd
    this.quantity = quantity
    this.unitPrice = unitPrice
  }
}
