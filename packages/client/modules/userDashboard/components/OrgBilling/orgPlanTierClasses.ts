import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'

type TierClasses = {
  cap: string
  highlight: string
  ink: string
}

const orgPlanTierClasses: Record<TierEnum, TierClasses> = {
  starter: {
    cap: 'bg-grape-500',
    highlight: 'border-grape-500 ring-1 ring-grape-500',
    ink: 'text-grape-600 dark:text-grape-400'
  },
  team: {
    cap: 'bg-gold-400',
    highlight: 'border-gold-400 ring-1 ring-gold-400',
    ink: 'text-gold-700 dark:text-gold-300'
  },
  enterprise: {
    cap: 'bg-sky-500',
    highlight: 'border-sky-500 ring-1 ring-sky-500',
    ink: 'text-sky-600 dark:text-sky-300'
  }
}

export default orgPlanTierClasses
