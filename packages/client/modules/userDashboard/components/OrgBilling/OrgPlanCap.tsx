import {CheckCircle, Star} from '~/ui/icons'
import enterpriseIllustration from '../../../../../../static/images/illustrations/plan_tiers-enterprise.png'
import starterIllustration from '../../../../../../static/images/illustrations/plan_tiers-starter.png'
import teamIllustration from '../../../../../../static/images/illustrations/plan_tiers-team.png'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import {cn} from '../../../../ui/cn'
import orgPlanDetails from './orgPlanDetails'
import orgPlanTierClasses from './orgPlanTierClasses'

const ILLUSTRATIONS: Record<TierEnum, string> = {
  starter: starterIllustration,
  team: teamIllustration,
  enterprise: enterpriseIllustration
}

const TAGS = {
  current: {Icon: CheckCircle, label: 'Current plan'},
  recommended: {Icon: Star, label: 'Recommended'}
} as const

export type PlanTag = keyof typeof TAGS

type Props = {
  tier: TierEnum
  tag: PlanTag | null
}

const OrgPlanCap = (props: Props) => {
  const {tier, tag} = props
  const {price, priceUnit} = orgPlanDetails[tier]
  const tagDetails = tag ? TAGS[tag] : null
  return (
    <div className={cn('@container text-grape-900', orgPlanTierClasses[tier].cap)}>
      <div className='grid @[13.75rem]:grid-cols-[minmax(7.25rem,1fr)_minmax(0,6.5rem)] grid-cols-1 gap-2 pt-3.5 pr-3 pb-4 pl-5'>
        <div className='flex min-w-0 flex-col'>
          <div className={cn('mb-2 h-[22px]', tagDetails ? 'flex' : '@2xl/plans:flex hidden')}>
            {tagDetails && (
              <span className='inline-flex items-center gap-1 rounded bg-grape-900 pr-2.5 pl-2 font-semibold text-white text-xs leading-none'>
                <tagDetails.Icon className='text-[14px]' />
                {tagDetails.label}
              </span>
            )}
          </div>
          <h6 className='m-0 font-semibold text-[22px] capitalize leading-[30px]'>{tier}</h6>
          <div className='mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
            <span className='font-semibold text-[32px] leading-9 tracking-[-0.01em]'>{price}</span>
            <span className='font-medium text-sm leading-5'>{priceUnit}</span>
          </div>
        </div>
        <img
          className='-my-1.5 @[13.75rem]:block hidden w-full self-center'
          src={ILLUSTRATIONS[tier]}
          alt=''
        />
      </div>
    </div>
  )
}

export default OrgPlanCap
