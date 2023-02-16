import styled from '@emotion/styled'
import React from 'react'
import FlatPrimaryButton from '../../../../components/FlatPrimaryButton'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'

const StyledPanel = styled(Panel)({
  maxWidth: '90%',
  padding: '0px 8px 16px 8px'
})

const StyledRow = styled(Row)({
  padding: '12px 8px',
  display: 'flex',
  flex: 1,
  justifyContent: 'space-evenly',
  flexWrap: 'nowrap',
  ':first-of-type': {
    paddingTop: 16
  },
  ':nth-of-type(2)': {
    border: 'none'
  }
})

const StatBlocks = styled('div')({
  display: 'flex',
  width: '100%',
  flexWrap: 'wrap'
})

const StatBlock = styled('div')<{isDesktop: boolean}>(({isDesktop}) => ({
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  ':first-of-type': {
    border: 'none',
    borderBottom: isDesktop ? 'none' : `1px solid ${PALETTE.SLATE_400}`
  },
  ':nth-of-type(2)': {
    borderBottom: isDesktop ? 'none' : `1px solid ${PALETTE.SLATE_400}`
  },
  ':nth-of-type(3)': {
    borderLeft: isDesktop ? `1px solid ${PALETTE.SLATE_400}` : 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '33.33%',
  paddingTop: 14,
  paddingBottom: 14
}))

const StatBlockNumber = styled('div')({
  color: PALETTE.SLATE_600,
  fontSize: 40,
  lineHeight: '60px'
})

const StatBlockLabel = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center'
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
  justifyContent: 'center',
  alignItems: 'center'
})

const SubtitleBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  lineHeight: '30px'
})

const PlanSubtitle = styled('span')<{isItalic?: boolean}>(({isItalic}) => ({
  color: PALETTE.SLATE_800,
  fontSize: 20,
  width: '100%',
  lineHeight: '30px',
  textTransform: 'none',
  textAlign: 'center',
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
  alignContent: 'space-between',
  height: 400,
  borderRadius: 4,
  border: `2px solid transparent`,
  '&:hover': {
    border: `2px solid ${PALETTE.SKY_500}`
  }
}))

const UL = styled('ul')({})

const LI = styled('li')({
  fontSize: 18,
  lineHeight: '28px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left'
})

const ButtonBlock = styled('div')({
  width: '100%',
  display: 'flex',
  justifyContent: 'center'
})

const UpgradeButton = styled(FlatPrimaryButton)({
  width: '80%'
})

const OrgPlans = () => {
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <StatBlocks>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Organization'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Team'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Member'}</StatBlockLabel>
          </StatBlock>
        </StatBlocks>
      </StyledRow>
      <StyledRow>
        <Plan tier='starter'>
          <PlanTitle>{'Starter'}</PlanTitle>
          <PlanSubtitle>{'Free'}</PlanSubtitle>
          <UL>
            <LI>2 teams</LI>
            <LI>Essential templates</LI>
            <LI>Retrospectives, Sprint Poker, Standups, Check-Ins</LI>
            <LI>Unlimited team members</LI>
          </UL>
          <ButtonBlock>
            <UpgradeButton size='medium'>{'Current Plan'}</UpgradeButton>
          </ButtonBlock>
        </Plan>
        <Plan tier='team'>
          <PlanTitle>{'Team'}</PlanTitle>
          <SubtitleBlock>
            <PlanSubtitle>{'$6 per active member '}</PlanSubtitle>
            <PlanSubtitle isItalic>{'paid monthly'}</PlanSubtitle>
          </SubtitleBlock>
          <UL>
            <LI>Everything in Starter</LI>
            <LI>Premium templates</LI>
            <LI>Custom templates</LI>
            <LI>Unlimited teams</LI>
          </UL>
          <ButtonBlock>
            <UpgradeButton size='medium'>{'Current Plan'}</UpgradeButton>
          </ButtonBlock>
        </Plan>
        <Plan tier='enterprise'>
          <PlanTitle>{'Enterprise'}</PlanTitle>
          <PlanSubtitle>{'Contact for quote'}</PlanSubtitle>
          <UL>
            <LI>Everything in Team</LI>
            <LI>SSO</LI>
          </UL>
          <ButtonBlock>
            <UpgradeButton size='medium'>{'Current Plan'}</UpgradeButton>
          </ButtonBlock>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
