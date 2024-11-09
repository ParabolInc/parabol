import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import useModal from '../../../../hooks/useModal'
import {ElementWidth} from '../../../../types/constEnums'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import {EnterpriseBenefits, StarterBenefits, TeamBenefits} from '../../../../utils/constants'
import DowngradeModal from './DowngradeModal'
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
        ...DowngradeModal_organization
        ...LimitExceededWarning_organization
        id
        billingTier
      }
    `,
    organizationRef
  )
  const {closePortal: closeModal, openPortal, modalPortal} = useModal()
  const atmosphere = useAtmosphere()
  const {id: orgId, billingTier} = organization
  const isTablet = useBreakpoint(Breakpoint.FUZZY_TABLET)

  const plans = [
    {
      tier: 'starter',
      subtitle: 'Free',
      details: [...StarterBenefits],
      buttonStyle: getButtonStyle(billingTier, 'starter'),
      buttonLabel: getButtonLabel(billingTier, 'starter'),
      isActive: !hasSelectedTeamPlan && billingTier === 'starter'
    },
    {
      tier: 'team',
      details: ['Everything in Starter', ...TeamBenefits],
      buttonStyle: getButtonStyle(billingTier, 'team'),
      buttonLabel: getButtonLabel(billingTier, 'team'),
      isActive: hasSelectedTeamPlan || billingTier === 'team'
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', ...EnterpriseBenefits],
      buttonStyle: getButtonStyle(billingTier, 'enterprise'),
      buttonLabel: getButtonLabel(billingTier, 'enterprise'),
      isActive: billingTier === 'enterprise'
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
