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
  maxWidth: 800
})

const StyledRow = styled(Row)({
  padding: '12px 8px 12px 16px'
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

const PlanSubtitle = styled('div')({
  color: PALETTE.SLATE_800,
  fontSize: 20,
  width: '100%',
  lineHeight: '30px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 400
})

const Plan = styled('div')<{type: TierEnum}>(({type}) => ({
  background: type === 'starter' ? PALETTE.STARTER : undefined,
  fontSize: 12,
  fontWeight: 600,
  lineHeight: '16px',
  textTransform: 'capitalize',
  textAlign: 'center',
  display: 'flex',
  alignItems: 'center',
  width: '33.33%',
  flexWrap: 'wrap',
  justifyContent: 'center',
  padding: '16px 8px'
}))

const UL = styled('ul')()

const LI = styled('li')({
  fontSize: 18,
  lineHeight: '28px',
  color: PALETTE.SLATE_900,
  textTransform: 'none',
  fontWeight: 400,
  textAlign: 'left'
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
        <Plan tier={'starter'}>
          <PlanTitle>{'Starter'}</PlanTitle>
          <PlanSubtitle>{'Free'}</PlanSubtitle>
          <UL>
            <LI>2 teams</LI>
            <LI>Essential templates</LI>
            <LI>Retrospectives, Sprint Poker, Standups, Check-Ins</LI>
            <LI>Unlimited team members</LI>
          </UL>
          <UpgradeButton size='medium'>{'Current Plan'}</UpgradeButton>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
