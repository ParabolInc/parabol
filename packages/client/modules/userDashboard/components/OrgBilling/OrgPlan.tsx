import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import {cn} from '../../../../ui/cn'
import getPlanAction, {type PlanAction} from './getPlanAction'
import OrgPlanAction from './OrgPlanAction'
import OrgPlanBenefits from './OrgPlanBenefits'
import OrgPlanCap from './OrgPlanCap'
import orgPlanDetails from './orgPlanDetails'
import orgPlanTierClasses from './orgPlanTierClasses'

type Props = {
  tier: TierEnum
  billingTier: TierEnum
  note: string
  isTeamSelected: boolean
  canChangePlans: boolean
  onAction: (action: PlanAction, tier: TierEnum) => void
}

const OrgPlan = (props: Props) => {
  const {tier, billingTier, note, isTeamSelected, canChangePlans, onAction} = props
  const action = getPlanAction(billingTier, tier)
  const isCurrent = action === 'current'
  const isSelected = isTeamSelected && tier === 'team'
  const isHighlighted = isTeamSelected ? isSelected : isCurrent
  const isRecommended = tier === 'team' && billingTier === 'starter'
  const tag = isCurrent ? 'current' : isRecommended ? 'recommended' : null

  return (
    <div
      className={cn(
        'row-span-5 grid grid-rows-subgrid gap-y-0 overflow-hidden rounded-lg border border-hairline-strong bg-surface-app text-fg-primary',
        isHighlighted && orgPlanTierClasses[tier].highlight
      )}
    >
      <OrgPlanCap tier={tier} tag={tag} />
      <p className='m-0 px-5 pt-4 text-fg-secondary text-sm leading-5'>
        {orgPlanDetails[tier].audience}
      </p>
      <p className='m-0 px-5 pt-1.5 font-medium text-[13px] leading-[18px]'>{note}</p>
      <div className='px-5 pt-3.5'>
        <OrgPlanAction
          tier={tier}
          action={action}
          isSelected={isSelected}
          canChangePlans={canChangePlans}
          onClick={() => onAction(action, tier)}
        />
      </div>
      <OrgPlanBenefits tier={tier} />
    </div>
  )
}

export default OrgPlan
