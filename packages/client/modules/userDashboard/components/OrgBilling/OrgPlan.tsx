import {Info} from '@mui/icons-material'
import {useState} from 'react'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import BaseButton from '../../../../components/BaseButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {cn} from '../../../../ui/cn'
import {MONTHLY_PRICE} from '../../../../utils/constants'

const TIER_BACKGROUND: Record<TierEnum, string> = {
  starter: 'bg-starter',
  team: 'bg-team',
  enterprise: 'bg-enterprise'
}

const TIER_ACTIVE_OUTLINE: Record<TierEnum, string> = {
  starter: 'outline-grape-500',
  team: 'outline-aqua-400',
  enterprise: 'outline-tomato-400'
}

const TIER_HOVER_OUTLINE: Record<TierEnum, string> = {
  starter: 'hover:outline-grape-500',
  team: 'hover:outline-aqua-400',
  enterprise: 'hover:outline-tomato-500'
}

const CTA_STYLES = {
  primary:
    'border-0 bg-linear-to-r from-tomato-600 to-rose-500 text-white shadow-[0px_5px_5px_-3px_rgba(0,0,0,.2),0px_8px_10px_1px_rgba(0,0,0,.14),0px_3px_14px_2px_rgba(0,0,0,.12)] hover:from-tomato-700 hover:to-rose-600',
  secondary:
    'border border-hairline-strong bg-surface-card text-fg-primary shadow-none hover:bg-surface-hover',
  disabled:
    'border border-hairline-strong bg-transparent text-fg-secondary shadow-none hover:bg-transparent'
} as const

type Props = {
  plan: {
    tier: TierEnum
    subtitle?: string
    details: readonly string[]
    buttonStyle: 'disabled' | 'primary' | 'secondary'
    buttonLabel: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan'
    buttonTooltip?: string
    isActive: boolean
  }
  isTablet: boolean
  handleClick: (
    label: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan',
    tier: TierEnum
  ) => void
}

const OrgPlan = (props: Props) => {
  const {plan, isTablet, handleClick} = props
  const {
    subtitle,
    tier: planTier,
    details,
    buttonStyle,
    buttonLabel: defaultLabel,
    buttonTooltip,
    isActive
  } = plan
  const [hasSelectedTeamPlan, setHasSelectedTeamPlan] = useState(false)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLSpanElement>(
    MenuPosition.LOWER_CENTER
  )

  const handleClickCTA = () => {
    handleClick(defaultLabel, planTier)
    if (buttonLabel === 'Select Plan') {
      setHasSelectedTeamPlan(true)
    }
  }

  const buttonLabel =
    defaultLabel === 'Select Plan' && hasSelectedTeamPlan ? 'Selected Plan' : defaultLabel

  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center rounded border-2 border-surface-card px-2 py-4 text-center font-semibold text-xs capitalize outline-2 outline-transparent transition-all duration-500 ease-[ease] last-of-type:mr-0 last-of-type:mb-0',
        TIER_BACKGROUND[planTier],
        isTablet ? 'mr-2 mb-0' : 'mr-0 mb-2',
        isActive && TIER_ACTIVE_OUTLINE[planTier],
        TIER_HOVER_OUTLINE[planTier]
      )}
      onClick={handleClickCTA}
    >
      <div className='flex w-full flex-wrap pb-6 leading-[30px]'>
        <h6 className='m-0 flex w-full justify-center pb-2 text-center font-semibold text-[22px] text-fg-primary capitalize leading-[30px]'>
          {planTier}
        </h6>
        {planTier === 'team' ? (
          <>
            <span className='flex w-full items-center justify-center font-normal text-[16px] text-fg-primary normal-case not-italic leading-6'>
              {`$${MONTHLY_PRICE} per active user `}
              <span
                className='flex h-[18px] w-[18px] items-center pl-2 text-fg-secondary hover:cursor-pointer'
                ref={originRef}
                onMouseOver={openTooltip}
                onMouseOut={closeTooltip}
              >
                {<Info />}
              </span>
            </span>
            <span className='flex w-full items-center justify-center font-normal text-[16px] text-fg-secondary normal-case italic leading-6'>
              {'paid monthly'}
            </span>
            {tooltipPortal('Active users are anyone who uses Parabol within a billing period')}
          </>
        ) : (
          <span className='flex w-full items-center justify-center font-normal text-[16px] text-fg-primary normal-case not-italic leading-6'>
            {subtitle}
          </span>
        )}
      </div>
      <ul className='m-0 mb-4 flex h-full w-4/5 flex-col items-center p-0 md:items-start'>
        {details.map((detail) => (
          <li
            className='list-none text-center font-normal text-[16px] text-fg-primary normal-case leading-8 md:list-disc md:text-left'
            key={detail}
          >
            {detail}
          </li>
        ))}
      </ul>
      <BaseButton
        className={cn(
          'w-4/5 rounded-md font-semibold opacity-100 transition-all duration-500 ease-[ease] hover:opacity-100',
          CTA_STYLES[buttonStyle]
        )}
        disabled={buttonStyle === 'disabled'}
        title={buttonTooltip}
        size='medium'
      >
        {buttonLabel}
      </BaseButton>
    </div>
  )
}

export default OrgPlan
