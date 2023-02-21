import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import React from 'react'
import FlatPrimaryButton from '../../../../components/FlatPrimaryButton'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'
import OrgStats from './OrgStats'

const StyledPanel = styled(Panel)({
  maxWidth: 976,
  padding: '0px 8px 16px 8px'
})

const StyledRow = styled(Row)({
  padding: '12px 8px',
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
  fontSize: 24,
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
  fontSize: 20,
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
  fontSize: 18,
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

const OrgPlans = () => {
  const plans = [
    {
      tier: 'starter',
      subtitle: 'Free',
      details: [
        '2 teams',
        'Essential templates',
        'Retrospectives, Sprint Poker, Standups, Check-Ins',
        'Unlimited team members'
      ],
      buttonStyle: 'disabled',
      buttonLabel: 'Current Plan'
    },
    {
      tier: 'team',
      details: [
        'Everything in Starter',
        'Premium templates',
        'Custom templates',
        'Unlimited teams'
      ],
      buttonStyle: 'primary',
      buttonLabel: 'Select Plan'
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', 'SSO'],
      buttonStyle: 'secondary',
      buttonLabel: 'Contact'
    }
  ] as const

  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <OrgStats />
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
                      {'$6 per active member '}
                      <StyledIcon>{<Info />}</StyledIcon>
                    </PlanSubtitle>
                    <PlanSubtitle isItalic>{'paid monthly'}</PlanSubtitle>
                  </>
                ) : (
                  <PlanSubtitle>{plan.subtitle}</PlanSubtitle>
                )}
              </HeadingBlock>
              {plan.details.map((detail) => (
                <UL key={detail}>
                  <LI>{detail}</LI>
                </UL>
              ))}
            </Content>
            <ButtonBlock>
              <UpgradeButton buttonStyle={plan.buttonStyle} size='medium'>
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
