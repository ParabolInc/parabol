interface Input {
  brand?: string
  expiry?: string
  last4?: string | number
}

export default class CreditCard {
  brand: string
  expiry: string
  last4: string
  constructor(input: Input = {}) {
    const {brand, expiry, last4} = input
    this.brand = brand || 'Unknown brand'
    this.expiry = expiry || 'Unknown expiration'
    this.last4 = String(last4) || '0000'
  }
}
