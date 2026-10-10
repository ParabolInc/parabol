import graphql from 'babel-plugin-relay/macro'
import {useState} from 'react'
import {useFragment} from 'react-relay'
import {Info} from '~/ui/icons'
import type {TierEnum} from '../../../../__generated__/OrganizationSubscription.graphql'
import type {OrgPlans_organization$key} from '../../../../__generated__/OrgPlans_organization.graphql'
import Panel from '../../../../components/Panel/Panel'
import useAtmosphere from '../../../../hooks/useAtmosphere'
import {MONTHLY_PRICE} from '../../../../utils/constants'
import plural from '../../../../utils/plural'
import SendClientSideEvent from '../../../../utils/SendClientSideEvent'
import DowngradeModal from './DowngradeModal'
import type {PlanAction} from './getPlanAction'
import OrgPlan from './OrgPlan'
import orgPlanDetails from './orgPlanDetails'

const PLAN_TIERS = ['starter', 'team', 'enterprise'] as const

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
        id
        billingTier
        isBillingLeader
        orgUserCount {
          activeUserCount
        }
      }
    `,
    organizationRef
  )
  const [isDowngradeOpen, setIsDowngradeOpen] = useState(false)
  const atmosphere = useAtmosphere()
  const {id: orgId, billingTier, isBillingLeader, orgUserCount} = organization
  const {activeUserCount} = orgUserCount
  const teamPlanNote = `About $${activeUserCount * MONTHLY_PRICE} a month for ${activeUserCount} active ${plural(activeUserCount, 'user')}`

  const handleAction = (action: PlanAction, tier: TierEnum) => {
    SendClientSideEvent(atmosphere, 'Plan Tier Selected', {orgId, tier})
    if (action === 'contact') {
      window.open('mailto:love@parabol.co', '_blank')
    } else if (action === 'upgrade') {
      handleSelectTeamPlan()
    } else if (action === 'downgrade') {
      setIsDowngradeOpen(true)
      SendClientSideEvent(atmosphere, 'Downgrade Clicked', {orgId, tier})
    }
  }

  return (
    <>
      <Panel className='max-w-[976px]' label='Plans'>
        <div className='@container/plans border-hairline border-t'>
          <div className='grid @2xl/plans:grid-cols-3 grid-cols-1 gap-3 p-4'>
            {PLAN_TIERS.map((tier) => (
              <OrgPlan
                key={tier}
                tier={tier}
                billingTier={billingTier}
                note={orgPlanDetails[tier].note ?? teamPlanNote}
                isTeamSelected={hasSelectedTeamPlan && billingTier === 'starter'}
                canChangePlans={isBillingLeader}
                onAction={handleAction}
              />
            ))}
          </div>
        </div>
        <p className='m-0 flex items-start gap-2 px-4 pb-4 text-[13px] text-fg-secondary leading-[18px]'>
          <Info className='mt-px text-[16px] text-fg-muted' />
          {
            'Active users are people seen in the last 30 days. Billed monthly in USD. Downgrade any time and keep your data.'
          }
        </p>
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
