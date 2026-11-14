import {Fragment} from 'react'
import {Check, RemoveCircle} from '~/ui/icons'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import LabelHeading from '../../../../components/LabelHeading/LabelHeading'
import {cn} from '../../../../ui/cn'
import orgPlanDetails from './orgPlanDetails'
import orgPlanTierClasses from './orgPlanTierClasses'

const INCLUDED_LABELS: Record<TierEnum, string> = {
  starter: 'Included',
  team: 'Everything in Starter, plus',
  enterprise: 'Everything in Team, plus'
}

type Props = {
  tier: TierEnum
}

const OrgPlanBenefits = (props: Props) => {
  const {tier} = props
  const {included, limits} = orgPlanDetails[tier]
  const groups = [
    {label: INCLUDED_LABELS[tier], benefits: included, Icon: Check, isLimit: false},
    ...(limits ? [{label: 'Limits', benefits: limits, Icon: RemoveCircle, isLimit: true}] : [])
  ]
  return (
    <div className='flex flex-col gap-3 px-5 pt-5 pb-6 text-sm leading-5'>
      {groups.map(({label, benefits, Icon, isLimit}) => (
        <Fragment key={label}>
          <LabelHeading className={cn(isLimit && 'mt-2')}>{label}</LabelHeading>
          <ul
            className={cn(
              'm-0 flex list-none flex-col gap-2.5 p-0',
              isLimit && 'text-fg-secondary'
            )}
          >
            {benefits.map(({title, detail}) => (
              <li key={title} className='grid grid-cols-[18px_minmax(0,1fr)] gap-2.5'>
                <Icon className={cn('mt-px text-[18px]', orgPlanTierClasses[tier].ink)} />
                <span>
                  <span className='font-semibold'>{title}</span>
                  {detail && ` ${detail}`}
                </span>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </div>
  )
}

export default OrgPlanBenefits
