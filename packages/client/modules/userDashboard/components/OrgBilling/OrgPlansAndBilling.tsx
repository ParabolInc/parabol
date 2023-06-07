import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
import PaymentDetails from './PaymentDetails'
import BillingLeaders from './BillingLeaders'
import OrgPlans from './OrgPlans'
import OrgPlansAndBillingHeading from './OrgPlansAndBillingHeading'
import OrgPlanDrawer from './OrgPlanDrawer'

type Props = {
  organizationRef: OrgPlansAndBilling_organization$key
}

const OrgPlansAndBilling = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlansAndBilling_organization on Organization {
        ...OrgPlansAndBillingHeading_organization
        ...OrgPlans_organization
        ...BillingLeaders_organization
        ...PaymentDetails_organization
        ...OrgPlanDrawer_organization
        tier
      }
    `,
    organizationRef
  )
  const {tier} = organization

  return (
    <Suspense fallback={''}>
      <OrgPlansAndBillingHeading organizationRef={organization} />
      <OrgPlans organizationRef={organization} />
      {tier === 'starter' && <PaymentDetails organizationRef={organization} />}
      <BillingLeaders organizationRef={organization} />
      <OrgPlanDrawer organizationRef={organization} />
    </Suspense>
  )
}

export default OrgPlansAndBilling
