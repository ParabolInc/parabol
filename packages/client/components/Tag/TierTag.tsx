import type {TierEnum} from '../../__generated__/OrganizationSubscription.graphql'
import {TierLabel} from '../../types/constEnums'
import {cn} from '../../ui/cn'
import BaseTag from './BaseTag'

interface Props {
  className?: string
  tier: TierEnum | null
  billingTier: TierEnum | null
}

const TierTag = (props: Props) => {
  const {className, tier, billingTier} = props
  if (tier !== billingTier)
    return (
      <BaseTag className={cn('bg-slate-200 text-slate-700', className)}>{'Free Trial'}</BaseTag>
    )
  if (tier === 'starter')
    return (
      <BaseTag className={cn('bg-slate-200 text-slate-700', className)}>
        {TierLabel.STARTER}
      </BaseTag>
    )
  if (tier === 'team')
    return (
      <BaseTag className={cn('bg-gold-300 text-grape-700', className)}>{TierLabel.TEAM}</BaseTag>
    )
  if (tier === 'enterprise')
    return (
      <BaseTag className={cn('bg-sky-500 text-white', className)}>{TierLabel.ENTERPRISE}</BaseTag>
    )
  return null
}
export default TierTag
