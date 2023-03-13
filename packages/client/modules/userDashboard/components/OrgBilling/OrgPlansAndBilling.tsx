import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
import Billing from './Billing'
import OrgPlans from './OrgPlans'
import OrgPlansAndBillingHeading from './OrgPlansAndBillingHeading'

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
      }
    `,
    organizationRef
  )

  return (
    <Suspense fallback={''}>
      <OrgPlansAndBillingHeading organizationRef={organization} />
      <OrgPlans organizationRef={organization} />
      <Billing />
    </Suspense>
  )
}

export default OrgPlansAndBilling
