interface Input {
  id: string
  amountOff?: number
  name: string
  percentOff?: number
}

export default class Coupon {
  id: string
  amountOff?: number
  name: string
  percentOff?: number

  constructor(input: Input) {
    const {id, amountOff, name, percentOff} = input
    this.id = id
    this.amountOff = amountOff
    this.percentOff = percentOff
    this.name = name
  }
}
