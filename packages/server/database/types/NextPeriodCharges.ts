type IntervalUnit = 'day' | 'week' | 'month' | 'year'
interface Input {
  amount: number
  quantity: number
  nextPeriodEnd: Date
  unitPrice?: number
  interval: IntervalUnit
}

export default class NextPeriodCharges {
  amount: number
  quantity: number
  nextPeriodEnd: Date
  unitPrice?: number
  interval: IntervalUnit
  constructor(input: Input) {
    const {amount, quantity, unitPrice, nextPeriodEnd, interval} = input
    this.amount = amount
    this.quantity = quantity
    this.nextPeriodEnd = nextPeriodEnd
    this.unitPrice = unitPrice
    this.interval = interval
  }
}
