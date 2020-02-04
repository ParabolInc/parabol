import shortid from 'shortid'
import {TierEnum} from 'parabol-client/types/graphql'
import CreditCard from './CreditCard'

interface Input {
  id?: string
  creditCard?: CreditCard
  createdAt?: Date
  name: string
  picture?: string
  tier: TierEnum
  updatedAt?: Date
  showConversionModal?: boolean
  payLaterClickCount?: number
}

export default class Organization {
  id: string
  creditCard?: CreditCard
  createdAt: Date
  name: string
  payLaterClickCount: number
  periodEnd?: Date
  periodStart?: Date
  picture?: string
  showConversionModal?: boolean
  stripeId?: string
  stripeSubscriptionId?: string | null
  upcomingInvoiceEmailSentAt?: Date
  tier: TierEnum
  updatedAt: Date
  constructor(input: Input) {
    const {
      id,
      createdAt,
      updatedAt,
      creditCard,
      name,
      showConversionModal,
      payLaterClickCount,
      picture,
      tier
    } = input
    this.id = id || shortid.generate()
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.creditCard = creditCard
    this.name = name
    this.tier = tier
    this.picture = picture
    this.showConversionModal = showConversionModal === null ? undefined : showConversionModal
    this.payLaterClickCount = payLaterClickCount || 0
  }
}
