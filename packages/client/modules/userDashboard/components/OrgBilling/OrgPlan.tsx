import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import {useState} from 'react'
import {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import BaseButton from '../../../../components/BaseButton'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {Radius} from '../../../../types/constEnums'
import {MONTHLY_PRICE} from '../../../../utils/constants'

const PlanTitle = styled('h6')({
  color: PALETTE.SLATE_700,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  margin: 0,
  width: '100%',
  paddingBottom: 8,
  justifyContent: 'center'
})

const HeadingBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  lineHeight: '30px',
  paddingBottom: 24
})

const PlanSubtitle = styled('span')<{isItalic?: boolean}>(({isItalic}) => ({
  color: PALETTE.SLATE_800,
  fontSize: 16,
  width: '100%',
  lineHeight: '24px',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 400,
  fontStyle: isItalic ? 'italic' : 'normal'
}))

const UL = styled('ul')({
  margin: '0 0 16px 0',
  height: '100%',
  padding: 0,
  width: '80%'
})

const LI = styled('li')({
  fontSize: 16,
  lineHeight: '32px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400
})

const StyledIcon = styled('span')({
  width: 18,
  height: 18,
  color: PALETTE.SLATE_600,
  paddingLeft: 8,
  display: 'flex',
  alignItems: 'center',
  '&:hover': {
    cursor: 'pointer'
  }
})

const Plan = styled('div')<{tier: TierEnum; isTablet: boolean; isActive: boolean}>(
  ({tier, isTablet, isActive}) => ({
    background:
      tier === 'starter' ? PALETTE.STARTER : tier === 'team' ? PALETTE.TEAM : PALETTE.ENTERPRISE,
    fontSize: 12,
    fontWeight: 600,
    lineHeight: '16px',
    textTransform: 'capitalize',
    textAlign: 'center',
    display: 'flex',
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: isTablet ? 0 : '8px',
    marginRight: isTablet ? '8px' : 0,
    padding: '16px 8px',
    borderRadius: 4,
    border: '2px solid white',
    outline: isActive
      ? tier === 'starter'
        ? `2px solid ${PALETTE.GRAPE_500}`
        : tier === 'team'
          ? `2px solid ${PALETTE.AQUA_400}`
          : `2px solid ${PALETTE.TOMATO_400}`
      : '2px solid transparent',
    transition: 'all ease 0.5s',
    '&:hover': {
      outline: `2px solid ${
        tier === 'starter'
          ? PALETTE.GRAPE_500
          : tier === 'team'
            ? PALETTE.AQUA_400
            : PALETTE.TOMATO_500
      }`
    },
    '&:last-of-type': {
      marginBottom: 0,
      marginRight: 0
    }
  })
)

const CTAButton = styled(BaseButton)<{
  buttonStyle: 'disabled' | 'primary' | 'secondary'
}>(({buttonStyle}) => ({
  width: '80%',
  boxShadow: buttonStyle === 'primary' ? Elevation.Z8 : Elevation.Z0,
  bottom: 0,
  fontWeight: 600,
  borderRadius: Radius.BUTTON_PILL,
  background:
    buttonStyle === 'primary'
      ? PALETTE.GRADIENT_TOMATO_600_ROSE_500
      : buttonStyle === 'secondary'
        ? PALETTE.WHITE
        : PALETTE.SLATE_300,
  color:
    buttonStyle === 'primary'
      ? PALETTE.WHITE
      : buttonStyle === 'secondary'
        ? PALETTE.SLATE_900
        : PALETTE.SLATE_600,
  border: buttonStyle === 'secondary' ? `1px solid ${PALETTE.SLATE_600}` : 'none',
  transition: 'all ease 0.5s',
  ':hover': {
    cursor: buttonStyle === 'disabled' ? 'default' : 'pointer',
    background:
      buttonStyle === 'primary'
        ? PALETTE.GRADIENT_TOMATO_700_ROSE_600
        : buttonStyle === 'secondary'
          ? PALETTE.SLATE_300
          : PALETTE.SLATE_300
  }
}))

type Props = {
  plan: {
    tier: TierEnum
    subtitle?: string
    details: readonly string[]
    buttonStyle: 'disabled' | 'primary' | 'secondary'
    buttonLabel: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan'
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
  const {subtitle, tier: planTier, details, buttonStyle, buttonLabel: defaultLabel, isActive} = plan
  const [hasSelectedTeamPlan, setHasSelectedTeamPlan] = useState(false)
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
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
    <Plan tier={planTier} isTablet={isTablet} isActive={isActive} onClick={handleClickCTA}>
      <HeadingBlock>
        <PlanTitle>{planTier}</PlanTitle>
        {planTier === 'team' ? (
          <>
            <PlanSubtitle>
              {`$${MONTHLY_PRICE} per active user `}
              <StyledIcon ref={originRef} onMouseOver={openTooltip} onMouseOut={closeTooltip}>
                {<Info />}
              </StyledIcon>
            </PlanSubtitle>
            <PlanSubtitle isItalic>{'paid monthly'}</PlanSubtitle>
            {tooltipPortal('Active users are anyone who uses Parabol within a billing period')}
          </>
        ) : (
          <PlanSubtitle>{subtitle}</PlanSubtitle>
        )}
      </HeadingBlock>
      <UL className={'flex flex-col items-center md:items-start'}>
        {details.map((detail) => (
          <LI className={'list-none text-center md:list-disc md:text-left'} key={detail}>
            {detail}
          </LI>
        ))}
      </UL>
      <CTAButton buttonStyle={buttonStyle} size='medium'>
        {buttonLabel}
      </CTAButton>
    </Plan>
  )
}

export default OrgPlan
