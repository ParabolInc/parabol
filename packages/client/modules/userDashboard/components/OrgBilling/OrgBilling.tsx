import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery, useRefetchableFragment} from 'react-relay'
import {OrgBillingQuery} from '../../../../__generated__/OrgBillingQuery.graphql'
import {OrgBillingRefetchQuery} from '../../../../__generated__/OrgBillingRefetchQuery.graphql'
import {OrgBilling_organization$key} from '../../../../__generated__/OrgBilling_organization.graphql'
import {OrgBilling_viewer$key} from '../../../../__generated__/OrgBilling_viewer.graphql'
import OrgBillingCreditCardInfo from './OrgBillingCreditCardInfo'
import OrgBillingDangerZone from './OrgBillingDangerZone'
import OrgBillingInvoices from './OrgBillingInvoices'
import OrgBillingUpgrade from './OrgBillingUpgrade'

interface Props {
  queryRef: PreloadedQuery<OrgBillingQuery>
  organizationRef: OrgBilling_organization$key
}

const OrgBilling = (props: Props) => {
  const {queryRef, organizationRef} = props
  const viewRef = usePreloadedQuery<OrgBillingQuery>(
    graphql`
      query OrgBillingQuery($orgId: ID!, $first: Int!, $after: DateTime) {
        ...OrgBilling_viewer
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )
  const [viewer, refetch] = useRefetchableFragment<OrgBillingRefetchQuery, OrgBilling_viewer$key>(
    graphql`
      fragment OrgBilling_viewer on Query @refetchable(queryName: "OrgBillingRefetchQuery") {
        ...OrgBillingInvoices_viewer
      }
    `,
    viewRef
  )
  const organization = useFragment(
    graphql`
      fragment OrgBilling_organization on Organization {
        ...OrgBillingCreditCardInfo_organization
        ...OrgBillingUpgrade_organization
        ...OrgBillingDangerZone_organization
        id
      }
    `,
    organizationRef
  )
  return (
    <div>
      <OrgBillingUpgrade organization={organization} invoiceListRefetch={refetch} />
      <OrgBillingCreditCardInfo organization={organization} />
      <OrgBillingInvoices viewerRef={viewer} />
      <OrgBillingDangerZone organization={organization} />
    </div>
  )
}

export default OrgBilling
