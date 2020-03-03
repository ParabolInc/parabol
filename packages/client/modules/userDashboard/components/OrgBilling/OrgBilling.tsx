import React from 'react'
import {createFragmentContainer} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import {OrgBilling_viewer} from '../../../../__generated__/OrgBilling_viewer.graphql'
import {OrgBilling_organization} from '../../../../__generated__/OrgBilling_organization.graphql'
import OrgBillingCreditCardInfo from './OrgBillingCreditCardInfo'
import OrgBillingInvoices from './OrgBillingInvoices'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import OrgBillingUpgrade from './OrgBillingUpgrade'

interface Props {
  viewer: OrgBilling_viewer
  organization: OrgBilling_organization
}

const OrgBilling = (props: Props) => {
  const {organization, viewer} = props
  return (
    <div>
      <OrgBillingUpgrade organization={organization} />
      <OrgBillingCreditCardInfo organization={organization} />
      <OrgBillingInvoices viewer={viewer} />
      <OrgBillingDangerZone organization={organization} />
    </div>
  )
}

export default createFragmentContainer(OrgBilling, {
  viewer: graphql`
    fragment OrgBilling_viewer on User {
      ...OrgBillingInvoices_viewer
    }
  `,
  organization: graphql`
    fragment OrgBilling_organization on Organization {
      ...OrgBillingCreditCardInfo_organization
      ...OrgBillingUpgrade_organization
      ...OrgBillingDangerZone_organization
      id
    }
  `
})
