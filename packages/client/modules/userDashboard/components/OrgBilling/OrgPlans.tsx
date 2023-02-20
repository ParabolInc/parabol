import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import React from 'react'
import FlatPrimaryButton from '../../../../components/FlatPrimaryButton'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useBreakpoint from '../../../../hooks/useBreakpoint'
import {PALETTE} from '../../../../styles/paletteV3'
import {Breakpoint} from '../../../../types/constEnums'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'

const StyledPanel = styled(Panel)({
  maxWidth: 976,
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
  padding: '8px 0px',
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
  fontSize: 14,
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
  paddingBottom: 8,
  justifyContent: 'center',
  alignItems: 'center'
})

const HeadingBlock = styled('div')({
  display: 'flex',
  flexWrap: 'wrap',
  width: '100%',
  lineHeight: '30px',
  paddingBottom: 8
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
    border: `2px solid ${
      tier === 'starter'
        ? PALETTE.GRAPE_500
        : tier === 'team'
        ? PALETTE.AQUA_400
        : PALETTE.TOMATO_200
    }`
  }
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

const StyledIcon = styled('div')({
  height: 24,
  width: 24,
  color: PALETTE.SLATE_600,
  paddingLeft: 8,
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

const UpgradeButton = styled(FlatPrimaryButton)<{disabled?: boolean}>(({disabled}) => ({
  width: '80%',
  position: 'absolute',
  bottom: 0,
  background: disabled ? PALETTE.SLATE_300 : PALETTE.GRADIENT_TOMATO_600_ROSE_500,
  color: disabled ? PALETTE.SLATE_600 : PALETTE.WHITE
}))

const OrgPlans = () => {
  const isDesktop = useBreakpoint(Breakpoint.NEW_MEETING_SELECTOR)
  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <StatBlocks>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Teams'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Members'}</StatBlockLabel>
          </StatBlock>
          <StatBlock isDesktop={isDesktop}>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Total Meetings'}</StatBlockLabel>
          </StatBlock>
        </StatBlocks>
      </StyledRow>
      <StyledRow>
        <Plan tier='starter'>
          <Content>
            <HeadingBlock>
              <PlanTitle>{'Starter'}</PlanTitle>
              <PlanSubtitle>{'Free'}</PlanSubtitle>
            </HeadingBlock>
            <UL>
              <LI>2 teams</LI>
              <LI>Essential templates</LI>
              <LI>Retrospectives, Sprint Poker, Standups, Check-Ins</LI>
              <LI>Unlimited team members</LI>
            </UL>
          </Content>
          <ButtonBlock>
            <UpgradeButton disabled size='medium'>
              {'Current Plan'}
            </UpgradeButton>
          </ButtonBlock>
        </Plan>
        <Plan tier='team'>
          <Content>
            <HeadingBlock>
              <PlanTitle>{'Team'}</PlanTitle>
              <PlanSubtitle>
                {'$6 per active member '}
                <StyledIcon>{<Info />}</StyledIcon>
              </PlanSubtitle>
              <PlanSubtitle isItalic>{'paid monthly'}</PlanSubtitle>
            </HeadingBlock>
            <UL>
              <LI>Everything in Starter</LI>
              <LI>Premium templates</LI>
              <LI>Custom templates</LI>
              <LI>Unlimited teams</LI>
            </UL>
          </Content>
          <ButtonBlock>
            <UpgradeButton size='medium'>{'Selected'}</UpgradeButton>
          </ButtonBlock>
        </Plan>
        <Plan tier='enterprise'>
          <Content>
            <HeadingBlock>
              <PlanTitle>{'Enterprise'}</PlanTitle>
              <PlanSubtitle>{'Contact for quote'}</PlanSubtitle>
            </HeadingBlock>
            <UL>
              <LI>Everything in Team</LI>
              <LI>SSO</LI>
            </UL>
          </Content>
          <ButtonBlock>
            <UpgradeButton size='medium'>{'Contact Us'}</UpgradeButton>
          </ButtonBlock>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
