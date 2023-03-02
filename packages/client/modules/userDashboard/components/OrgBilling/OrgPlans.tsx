import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import FlatPrimaryButton from '../../../../components/FlatPrimaryButton'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {MenuPosition} from '../../../../hooks/useCoords'
import useTooltip from '../../../../hooks/useTooltip'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import {ElementWidth, Threshold} from '../../../../types/constEnums'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import OrgStats from './OrgStats'

const StyledPanel = styled(Panel)({
  maxWidth: ElementWidth.PANEL_WIDTH,
  paddingBottom: 16
})

const StyledRow = styled(Row)({
  padding: '12px 16px',
  display: 'flex',
  flex: 1,
  ':first-of-type': {
    paddingTop: 16
  },
  ':nth-of-type(2)': {
    border: 'none'
  }
})

const PlanTitle = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 22,
  fontWeight: 600,
  lineHeight: '30px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
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
  fontSize: 18,
  width: '100%',
  lineHeight: '30px',
  textTransform: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 400,
  fontStyle: isItalic ? 'italic' : 'normal'
}))

const Plan = styled('div')<{tier: TierEnum}>(({tier}) => ({
  background:
    tier === 'starter' ? PALETTE.STARTER : tier === 'team' ? PALETTE.TEAM : PALETTE.ENTERPRISE,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  flex: 1,
  margin: '0 8px',
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  padding: '16px 8px',
  height: 400,
  borderRadius: 4,
  border: `2px solid transparent`,
  '&:hover': {
    border: `2px solid ${
      tier === 'starter'
        ? PALETTE.GRAPE_500
        : tier === 'team'
        ? PALETTE.AQUA_400
        : PALETTE.TOMATO_200
    }`
  }
}))

const UL = styled('ul')({
  margin: 0
})

const LI = styled('li')({
  fontSize: 16,
  lineHeight: '32px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left'
})

const StyledIcon = styled('div')({
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

const Content = styled('div')({})

const ButtonBlock = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'center',
  position: 'relative'
})

const UpgradeButton = styled(FlatPrimaryButton)<{
  buttonStyle: 'disabled' | 'primary' | 'secondary'
}>(({buttonStyle}) => ({
  width: '80%',
  boxShadow: buttonStyle === 'primary' ? Elevation.Z8 : Elevation.Z0,
  position: 'absolute',
  bottom: 0,
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
  ':hover': {
    cursor: buttonStyle === 'disabled' ? 'default' : 'pointer',
    background:
      buttonStyle === 'primary'
        ? PALETTE.GRADIENT_TOMATO_700_ROSE_600
        : buttonStyle === 'secondary'
        ? PALETTE.SLATE_100
        : PALETTE.SLATE_300
  }
}))

const getButtonStyle = (tier: TierEnum, plan: TierEnum) => {
  if (tier === 'starter') {
    return plan === 'starter' ? 'disabled' : plan === 'team' ? 'primary' : 'secondary'
  } else if (tier === 'team') {
    return plan === 'team' ? 'disabled' : 'secondary'
  } else {
    return plan === 'enterprise' ? 'disabled' : 'secondary'
  }
}

const getButtonLabel = (tier: TierEnum, plan: TierEnum) => {
  if (tier === 'starter') {
    return plan === 'starter' ? 'Current Plan' : plan === 'team' ? 'Select Plan' : 'Contact'
  } else if (tier === 'team') {
    return plan === 'team' ? 'Current Plan' : plan === 'starter' ? 'Downgrade' : 'Contact'
  } else {
    return plan === 'enterprise' ? 'Current Plan' : 'Contact'
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
        tier
      }
    `,
    organizationRef
  )
  const {tooltipPortal, openTooltip, closeTooltip, originRef} = useTooltip<HTMLDivElement>(
    MenuPosition.LOWER_CENTER
  )
  const {tier} = organization

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
      buttonStyle: getButtonStyle(tier, 'starter'),
      buttonLabel: getButtonLabel(tier, 'starter')
    },
    {
      tier: 'team',
      details: [
        'Everything in Starter',
        'Premium templates',
        'Custom templates',
        'Unlimited teams'
      ],
      buttonStyle: getButtonStyle(tier, 'team'),
      buttonLabel: getButtonLabel(tier, 'team')
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', 'SSO'],
      buttonStyle: getButtonStyle(tier, 'enterprise'),
      buttonLabel: getButtonLabel(tier, 'enterprise')
    }
  ] as const

  const handleClick = (label: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan') => {
    if (label === 'Contact') {
      window.open('mailto:love@parabol.co', '_blank')
    } else if (label === 'Select Plan') {
      // TODO: handle select plan when billing is implemented
    } else if (label === 'Downgrade') {
      // TODO: handle in https://github.com/ParabolInc/parabol/issues/7697
    }
  }

  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <OrgStats organizationRef={organization} />
      </StyledRow>
      <StyledRow>
        {plans.map((plan) => (
          <Plan key={plan.tier} tier={plan.tier}>
            <Content>
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
              <UL>
                {plan.details.map((detail) => (
                  <LI key={detail}>{detail}</LI>
                ))}
              </UL>
            </Content>
            <ButtonBlock>
              <UpgradeButton
                onClick={() => handleClick(plan.buttonLabel)}
                buttonStyle={plan.buttonStyle}
                size='medium'
              >
                {plan.buttonLabel}
              </UpgradeButton>
            </ButtonBlock>
          </Plan>
        ))}
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
