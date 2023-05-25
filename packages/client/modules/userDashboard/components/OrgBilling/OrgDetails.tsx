import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
import PaymentDetails from './PaymentDetails'
import BillingLeaders from './BillingLeaders'
import OrgPlans from './OrgPlans'
import OrgPlansAndBillingHeading from './OrgPlansAndBillingHeading'
import OrgPlanDrawer from './OrgPlanDrawer'
import OrgBillingDangerZone from './OrgBillingDangerZone'

type Props = {
  organizationRef: OrgPlansAndBilling_organization$key
}

const OrgDetails = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgDetails_organization on Organization {
        ...OrgBillingDangerZone_organization
      }
    `,
    organizationRef
  )

  return (
    <Suspense fallback={''}>
      <OrgBillingDangerZone organization={organization} />
    </Suspense>
  )
}

export default OrgDetails
