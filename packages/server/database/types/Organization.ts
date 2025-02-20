import generateUID from '../../generateUID'
import {TierEnum} from '../../graphql/public/resolverTypes'
import {CreditCard} from '../../postgres/select'
import {defaultTier} from '../../utils/defaultTier'

interface Input {
  id?: string
  activeDomain?: string
  isActiveDomainTouched?: boolean
  creditCard?: CreditCard
  createdAt?: Date
  name: string
  picture?: string
  tier?: TierEnum
  updatedAt?: Date
  useAI?: boolean
}

export default class Organization {
  id: string
  activeDomain?: string
  isActiveDomainTouched?: boolean
  creditCard?: CreditCard
  createdAt: Date
  name: string
  periodEnd?: Date
  periodStart?: Date
  picture?: string
  stripeId?: string
  stripeSubscriptionId?: string | null
  upcomingInvoiceEmailSentAt?: Date
  tier: TierEnum
  tierLimitExceededAt?: Date | null
  trialStartDate?: Date | null
  scheduledLockAt?: Date | null
  lockedAt?: Date | null
  useAI: boolean
  updatedAt: Date
  constructor(input: Input) {
    const {
      id,
      activeDomain,
      isActiveDomainTouched,
      createdAt,
      updatedAt,
      creditCard,
      name,
      picture,
      tier,
      useAI
    } = input
    this.id = id || generateUID()
    this.activeDomain = activeDomain
    this.isActiveDomainTouched = isActiveDomainTouched
    this.createdAt = createdAt || new Date()
    this.updatedAt = updatedAt || new Date()
    this.creditCard = creditCard
    this.name = name
    this.tier = tier ?? defaultTier
    this.picture = picture
    this.useAI = useAI ?? true
  }
}
