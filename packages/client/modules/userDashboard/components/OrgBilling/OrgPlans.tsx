import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import {ElementWidth, Radius, Threshold} from '../../../../types/constEnums'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import OrgStats from './OrgStats'
import useModal from '../../../../hooks/useModal'
import DowngradeModal from './DowngradeModal'
import {TeamBenefits} from '../../../../utils/constants'
import SendClientSegmentEventMutation from '../../../../mutations/SendClientSegmentEventMutation'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import BaseButton from '../../../../components/BaseButton'
import LimitExceededWarning from '../../../../components/LimitExceededWarning'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH,
  paddingBottom: 16
})

const StyledRow = styled(Row)<{isTablet: boolean}>(({isTablet}) => ({
  padding: '12px 16px',
  display: 'flex',
  flex: 1,
  flexDirection: isTablet ? 'row' : 'column',
  alignItems: 'inherit',
  ':first-of-type': {
    paddingTop: 16
  },
  ':nth-of-type(2)': {
    border: 'none'
  }
}))

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

const Plan = styled('div')<{tier: TierEnum; isTablet: boolean; outlineColor: boolean}>(
  ({tier, isTablet, outlineColor}) => ({
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
    outline: outlineColor
      ? tier === 'starter'
        ? `2px solid ${PALETTE.GRAPE_500}`
        : tier === 'team'
        ? `2px solid ${PALETTE.AQUA_400}`
        : `2px solid ${PALETTE.TOMATO_400}`
      : '2px solid transparent',
    transition: 'all ease 0.5s',
    '&:hover': {
      cursor: 'pointer',
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
        ? PALETTE.TOMATO_100
        : PALETTE.SLATE_300,
    borderColor: buttonStyle === 'secondary' ? PALETTE.TOMATO_500 : 'none'
  }
}))

const getButtonStyle = (tier: TierEnum, plan: TierEnum) => {
  if (tier === plan) {
    return 'disabled'
  } else if (tier === 'starter') {
    return plan === 'team' ? 'primary' : 'secondary'
  } else {
    return 'secondary'
  }
}

const getButtonLabel = (tier: TierEnum, plan: TierEnum) => {
  if (tier === plan) {
    return 'Current Plan'
  } else if (tier === 'enterprise' || plan === 'enterprise') {
    return 'Contact'
  } else if (plan === 'starter') {
    return 'Downgrade'
  } else {
    return 'Select Plan'
  }
}

const getActivePlan = (tier: TierEnum, plan: TierEnum) => {
  if (tier === plan) {
    return true
  } else {
    return false
  }
}

type Props = {
  organizationRef: OrgPlans_organization$key
}

const OrgPlans = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlans_organization on Organization {
        ...OrgStats_organization
        ...DowngradeModal_organization
        ...LimitExceededWarning_organization
        id
        tier
        scheduledLockAt
        lockedAt
      }
    `,
    organizationRef
  )
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_CENTER
  )
  const {closePortal: closeModal, openPortal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  const {id: orgId, tier, scheduledLockAt, lockedAt} = organization
  const showNudge = scheduledLockAt || lockedAt
  const isTablet = useBreakpoint(Breakpoint.FUZZY_TABLET)

  const plans = [
    {
      tier: 'starter',
      subtitle: 'Free',
      details: [
        `${Threshold.MAX_STARTER_TIER_TEAMS} teams`,
        'Essential templates',
        'Retrospectives, Sprint Poker, Standups, Check-Ins',
        'Unlimited team members'
      ],
      activeColor: PALETTE.GRAPE_500,
      buttonStyle: getButtonStyle(tier, 'starter'),
      buttonLabel: getButtonLabel(tier, 'starter'),
      outlineColor: getActivePlan(tier, 'starter')
    },
    {
      tier: 'team',
      details: ['Everything in Starter', ...TeamBenefits],
      buttonStyle: getButtonStyle(tier, 'team'),
      buttonLabel: getButtonLabel(tier, 'team'),
      outlineColor: getActivePlan(tier, 'team')
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', 'SSO'],
      buttonStyle: getButtonStyle(tier, 'enterprise'),
      buttonLabel: getButtonLabel(tier, 'enterprise'),
      outlineColor: getActivePlan(tier, 'enterprise')
    }
  ] as const

  const handleClick = (
    label: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan',
    tier: TierEnum
  ) => {
    SendClientSegmentEventMutation(atmosphere, 'Plan Tier Selected', {
      orgId,
      tier
    })
    if (label === 'Contact') {
      window.open('mailto:love@parabol.co', '_blank')
    } else if (label === 'Select Plan') {
      // TODO: handle select plan when billing is implemented
    } else if (label === 'Downgrade') {
      openPortal()
      SendClientSegmentEventMutation(atmosphere, 'Downgrade Clicked', {
        orgId,
        tier
      })
    }
  }

  return (
    <>
      <StyledPanel label='Plans'>
        <StyledRow isTablet={isTablet}>
          {showNudge && <LimitExceededWarning organizationRef={organization} />}
          <OrgStats organizationRef={organization} />
        </StyledRow>
        <StyledRow isTablet={isTablet}>
          {plans.map((plan) => (
            <Plan
              key={plan.tier}
              tier={plan.tier}
              isTablet={isTablet}
              outlineColor={plan.outlineColor}
            >
              <HeadingBlock>
                <PlanTitle>{plan.tier}</PlanTitle>
                {plan.tier === 'team' ? (
                  <>
                    <PlanSubtitle>
                      {'$6 per active user '}
                      <StyledIcon
                        ref={originRef}
                        onMouseOver={openTooltip}
                        onMouseOut={closeTooltip}
                      >
                        {<Info />}
                      </StyledIcon>
                    </PlanSubtitle>
                    <PlanSubtitle isItalic>{'paid monthly'}</PlanSubtitle>
                    {tooltipPortal(
                      'Active users are anyone who uses Parabol within a billing period'
                    )}
                  </>
                ) : (
                  <PlanSubtitle>{plan.subtitle}</PlanSubtitle>
                )}
              </HeadingBlock>
              <UL className={'flex flex-col items-center md:items-start'}>
                {plan.details.map((detail) => (
                  <LI className={'list-none text-center md:list-disc md:text-left'} key={detail}>
                    {detail}
                  </LI>
                ))}
              </UL>
              <CTAButton
                onClick={() => handleClick(plan.buttonLabel, plan.tier)}
                buttonStyle={plan.buttonStyle}
                size='medium'
              >
                {plan.buttonLabel}
              </CTAButton>
            </Plan>
          ))}
        </StyledRow>
      </StyledPanel>
      {modalPortal(<DowngradeModal closeModal={closeModal} organizationRef={organization} />)}
    </>
  )
}

export default OrgPlans
