import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import {ElementWidth, Threshold} from '../../../../types/constEnums'
import {TierEnum} from '../../../../__generated__/NewMeetingQuery.graphql'
import OrgStats from './OrgStats'
import useModal from '../../../../hooks/useModal'
import DowngradeModal from './DowngradeModal'
import {EnterpriseBenefits, TeamBenefits} from '../../../../utils/constants'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import LimitExceededWarning from '../../../../components/LimitExceededWarning'
import {Breakpoint} from '~/types/constEnums'
import useBreakpoint from '~/hooks/useBreakpoint'
import OrgPlan from './OrgPlan'

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

type Props = {
  organizationRef: OrgPlans_organization$key
  handleSelectTeamPlan: () => void
  hasSelectedTeamPlan: boolean
}

const OrgPlans = (props: Props) => {
  const {organizationRef, handleSelectTeamPlan, hasSelectedTeamPlan} = props
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
  const {closePortal: closeModal, openPortal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  const {id: orgId, scheduledLockAt, lockedAt, tier} = organization
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
      buttonStyle: getButtonStyle(tier, 'starter'),
      buttonLabel: getButtonLabel(tier, 'starter'),
      isActive: !hasSelectedTeamPlan && tier === 'starter'
    },
    {
      tier: 'team',
      details: ['Everything in Starter', ...TeamBenefits],
      buttonStyle: getButtonStyle(tier, 'team'),
      buttonLabel: getButtonLabel(tier, 'team'),
      isActive: hasSelectedTeamPlan || tier === 'team'
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', ...EnterpriseBenefits],
      buttonStyle: getButtonStyle(tier, 'enterprise'),
      buttonLabel: getButtonLabel(tier, 'enterprise'),
      isActive: tier === 'enterprise'
    }
  ] as const

  const handleClick = (
    label: 'Contact' | 'Select Plan' | 'Downgrade' | 'Current Plan',
    planTier: TierEnum
  ) => {
    SendClientSideEvent(atmosphere, 'Plan Tier Selected', {
      orgId,
      tier: planTier
    })
    if (label === 'Contact') {
      window.open('mailto:love@parabol.co', '_blank')
    } else if (label === 'Select Plan') {
      handleSelectTeamPlan()
    } else if (label === 'Downgrade') {
      openPortal()
      SendClientSideEvent(atmosphere, 'Downgrade Clicked', {
        orgId,
        tier: planTier
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
            <OrgPlan key={plan.tier} plan={plan} isTablet={isTablet} handleClick={handleClick} />
          ))}
        </StyledRow>
      </StyledPanel>
      {modalPortal(<DowngradeModal closeModal={closeModal} organizationRef={organization} />)}
    </>
  )
}

export default OrgPlans
