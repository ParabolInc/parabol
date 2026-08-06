import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import useBreakpoint from '~/hooks/useBreakpoint'
import {Breakpoint} from '~/types/constEnums'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import type {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import Row from '../../../../components/Row/Row'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {cn} from '../../../../ui/cn'
import {EnterpriseBenefits, StarterBenefits, TeamBenefits} from '../../../../utils/constants'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import DowngradeModal from './DowngradeModal'
import OrgPlan from './OrgPlan'

const getButtonSettings = (tier: TierEnum, plan: TierEnum, canChangePlans: boolean) => {
  if (tier === plan) {
    return {
      buttonLabel: 'Current Plan' as const,
      buttonStyle: 'disabled' as const
    }
  } else if (tier === 'enterprise' || plan === 'enterprise') {
    return {
      buttonLabel: 'Contact' as const,
      buttonStyle: 'secondary' as const
    }
  } else if (plan === 'starter') {
    return {
      buttonLabel: 'Downgrade' as const,
      buttonStyle: canChangePlans ? ('secondary' as const) : ('disabled' as const),
      buttonTooltip: canChangePlans ? undefined : 'Only billing leaders can change plans'
    }
  } else {
    return {
      buttonLabel: 'Select Plan' as const,
      buttonStyle: 'primary' as const
    }
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
        isBillingLeader
      }
    `,
    organizationRef
  )
  const [isDowngradeOpen, setIsDowngradeOpen] = useState(false)
  const atmosphere = useAtmosphere()
  const {id: orgId, billingTier, isBillingLeader} = organization
  const isTablet = useBreakpoint(Breakpoint.FUZZY_TABLET)

  const plans = [
    {
      tier: 'starter',
      subtitle: 'Free',
      details: [...StarterBenefits],
      ...getButtonSettings(billingTier, 'starter', isBillingLeader),
      isActive: !hasSelectedTeamPlan && billingTier === 'starter'
    },
    {
      tier: 'team',
      details: ['Everything in Starter', ...TeamBenefits],
      ...getButtonSettings(billingTier, 'team', isBillingLeader),
      isActive: hasSelectedTeamPlan || billingTier === 'team'
    },
    {
      tier: 'enterprise',
      subtitle: 'Contact for quote',
      details: ['Everything in Team', ...EnterpriseBenefits],
      ...getButtonSettings(billingTier, 'enterprise', isBillingLeader),
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
      setIsDowngradeOpen(true)
      SendClientSideEvent(atmosphere, 'Downgrade Clicked', {
        orgId,
        tier: planTier
      })
    }
  }

  return (
    <>
      <Panel className='max-w-[976px] pb-4' label='Plans'>
        <Row
          className={cn(
            'flex flex-1 items-stretch px-4 py-3 first-of-type:pt-4 [&:nth-of-type(2)]:border-none',
            isTablet ? 'flex-row' : 'flex-col'
          )}
        >
          {plans.map((plan) => (
            <OrgPlan key={plan.tier} plan={plan} isTablet={isTablet} handleClick={handleClick} />
          ))}
        </Row>
      </Panel>
      <DowngradeModal
        isOpen={isDowngradeOpen}
        closeModal={() => setIsDowngradeOpen(false)}
        organizationRef={organization}
      />
    </>
  )
}

export default OrgPlans
