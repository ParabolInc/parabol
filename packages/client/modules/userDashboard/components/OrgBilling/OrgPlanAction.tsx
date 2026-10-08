import {CheckCircle} from '~/ui/icons'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import {Button} from '../../../../ui/Button/Button'
import {cn} from '../../../../ui/cn'
import type {PlanAction} from './getPlanAction'
import orgPlanTierClasses from './orgPlanTierClasses'

const LABELS = {
  contact: 'Contact sales',
  downgrade: 'Downgrade',
  upgrade: 'Upgrade to Team'
} as const

type Props = {
  tier: TierEnum
  action: PlanAction
  isSelected: boolean
  canChangePlans: boolean
  onClick: () => void
}

const OrgPlanAction = (props: Props) => {
  const {tier, action, isSelected, canChangePlans, onClick} = props
  if (action === 'current') {
    return (
      <div
        className={cn(
          'flex h-10 items-center justify-center gap-1.5 rounded-md border border-hairline-strong border-dashed font-semibold text-[15px]',
          orgPlanTierClasses[tier].ink
        )}
      >
        <CheckCircle className='text-[18px]' />
        {"You're on this plan"}
      </div>
    )
  }
  if (action === 'downgrade' && !canChangePlans) {
    return (
      <div className='flex h-10 items-center justify-center text-center text-[13px] text-fg-muted leading-[18px]'>
        {'Only billing leaders can change plans'}
      </div>
    )
  }
  return (
    <Button
      variant={action === 'upgrade' ? 'primary' : 'outline'}
      className='h-10 w-full text-[15px]'
      onClick={onClick}
    >
      {isSelected ? 'Plan selected' : LABELS[action]}
    </Button>
  )
}

export default OrgPlanAction
