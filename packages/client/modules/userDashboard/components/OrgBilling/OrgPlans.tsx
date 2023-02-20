import styled from '@emotion/styled'
import {Info} from '@mui/icons-material'
import React from 'react'
import FlatPrimaryButton from '../../../../components/FlatPrimaryButton'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {Elevation} from '../../../../styles/elevation'
import {PALETTE} from '../../../../styles/paletteV3'
import {TierEnum} from '../../../../__generated__/SendClientSegmentEventMutation.graphql'

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

const StatBlocks = styled('div')({
  display: 'flex',
  width: '100%',
  padding: '8px 0px'
})

const StatBlock = styled('div')({
  borderLeft: `1px solid ${PALETTE.SLATE_400}`,
  ':first-of-type': {
    borderLeft: 'none'
  },
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '33.33%',
  padding: '14px 0px'
})

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
  display: 'flex'
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
  paddingBottom: 8
})

const PlanSubtitle = styled('span')<{isItalic?: boolean}>(({isItalic}) => ({
  color: PALETTE.SLATE_800,
  fontSize: 20,
  width: '100%',
  lineHeight: '30px',
  textTransform: 'none',
  display: 'flex',
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
    background:
      buttonStyle === 'primary'
        ? PALETTE.GRADIENT_TOMATO_700_ROSE_600
        : buttonStyle === 'secondary'
        ? PALETTE.SLATE_100
        : PALETTE.SLATE_300
  }
}))

const OrgPlans = () => {
  return (
    <StyledPanel label='Plans'>
      <StyledRow>
        <StatBlocks>
          <StatBlock>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Teams'}</StatBlockLabel>
          </StatBlock>
          <StatBlock>
            <StatBlockNumber>{'18'}</StatBlockNumber>
            <StatBlockLabel>{'Active Members'}</StatBlockLabel>
          </StatBlock>
          <StatBlock>
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
            <UpgradeButton buttonStyle='disabled' size='medium'>
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
            <UpgradeButton buttonStyle='primary' size='medium'>
              {'Select Plan'}
            </UpgradeButton>
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
            <UpgradeButton buttonStyle='secondary' color='white' size='medium'>
              {'Contact'}
            </UpgradeButton>
          </ButtonBlock>
        </Plan>
      </StyledRow>
    </StyledPanel>
  )
}

export default OrgPlans
