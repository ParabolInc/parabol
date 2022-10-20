/// <reference types="stripe-v2" />

import {ValueOf} from '../types/generics'
import Legitity from '../validation/Legitity'

export const cardTypeLookup = {
  Visa: 'cc-visa-brands',
  MasterCard: 'cc-mastercard-brands',
  'American Express': 'cc-amex-brands',
  Discover: 'cc-discover-brands',
  'Diners Club': 'cc-diners-club-brands',
  JCB: 'cc-jcb-brands',
  Unknown: 'credit_card'
} as const

export type CardTypeIcon = ValueOf<typeof cardTypeLookup>

export const normalizeExpiry = (value = '', previousValue = '') => {
  const month = value.substr(0, 2)
  // left pad
  if (month.length === 1 && Number(month) > 1) {
    return `0${month}/`
  }
  // if backspacing or typing a month > 12
  if ((previousValue.length === 3 && value.length === 2) || parseInt(month, 10) > 12) {
    return value[0]
  }
  const numValue = value.replace(/[^\d]/g, '')
  if (numValue.length >= 2) {
    const prefix = `${numValue.substr(0, 2)}/`
    const year = numValue.substr(2)
    const currentYear = String(new Date().getFullYear()).substr(2)
    // only 201x+
    if (year.length === 0 || (year.length === 1 && year < currentYear[0]!)) {
      return prefix
    }
    // only 2017+
    if (year.length > 0 && year < currentYear) {
      return `${prefix}${year[0]}`
    }
    // final value
    return `${prefix}${numValue.substr(2)}`
  }
  // correct month (october+)
  return value
}

export const normalizeNumeric = (value: string) => value.replace(/[^\d]/g, '')

export enum StripeError {
  cvc = 'Invalid CVC',
  expiry = 'Invalid expiration',
  creditCardNumber = 'Invalid credit card'
}

export default class StripeClientManager {
  stripe: stripe.StripeStatic | undefined

  init = (stripe: stripe.StripeStatic = (window as any).Stripe) => {
    if (stripe) {
      stripe.setPublishableKey(window.__ACTION__.stripe)
      this.stripe = stripe
    }
  }

  createToken = (fields: stripe.StripeCardTokenData) => {
    return new Promise<stripe.StripeCardTokenResponse>((resolve, reject) => {
      if (!this.stripe) {
        reject('Stripe not loaded')
      } else {
        this.stripe.card.createToken(fields, (_status, response) => {
          resolve(response)
        })
      }
    })
  }

  normalizeCardNumber = (number: string) => {
    return normalizeNumeric(number)
  }

  normalizeExpiry = (expiry: string) => {
    return normalizeExpiry(expiry)
  }

  normalizeCVC = (cvc: string) => {
    return normalizeNumeric(cvc)
  }

  validateCardNumber = (number: string) => {
    return new Legitity(number).test((value) => {
      return !this.stripe || this.stripe.validateCardNumber(value)
        ? undefined
        : StripeError.creditCardNumber
    })
  }

  validateExpiry = (expiry: string) => {
    return new Legitity(expiry).test((value) => {
      return !this.stripe || (this.stripe.validateExpiry as any)(value)
        ? undefined
        : StripeError.expiry
    })
  }

  validateCVC = (cvc: string) => {
    return new Legitity(cvc).test((value) => {
      return !this.stripe || this.stripe.validateCVC(value) ? undefined : StripeError.cvc
    })
  }

  cardTypeIcon = (number: string) => {
    if (!this.stripe) return 'credit_card'
    const type = this.stripe.cardType(number)
    return cardTypeLookup[type]
  }
}
