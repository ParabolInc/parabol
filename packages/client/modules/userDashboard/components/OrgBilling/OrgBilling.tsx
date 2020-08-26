import React from 'react'
import {createRefetchContainer, RelayRefetchProp} from 'react-relay'
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
  relay: RelayRefetchProp
}

const OrgBilling = (props: Props) => {
  const {organization, viewer, relay} = props
  return (
    <div>
      <OrgBillingUpgrade organization={organization} invoiceListRefetch={relay && relay.refetch} />
      <OrgBillingCreditCardInfo organization={organization} />
      <OrgBillingInvoices viewer={viewer} />
      <OrgBillingDangerZone organization={organization} />
    </div>
  )
}

export default createRefetchContainer(
  OrgBilling,
  {
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
  },
  graphql`
    query OrgBillingQuery($first: Int!, $after: DateTime, $orgId: ID!) {
      viewer {
        ...OrgBillingInvoices_viewer
      }
    }
  `
)
