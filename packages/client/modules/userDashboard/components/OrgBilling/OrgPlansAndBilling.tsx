import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {useFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
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
    <>
      <OrgPlansAndBillingHeading organizationRef={organization} />
      <OrgPlans organizationRef={organization} />
    </>
  )
}

export default OrgPlansAndBilling
