import graphql from 'babel-plugin-relay/macro'
import React from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery, useRefetchableFragment} from 'react-relay'
import {OrgBillingQuery} from '../../../../__generated__/OrgBillingQuery.graphql'
import {OrgBillingRefetchQuery} from '../../../../__generated__/OrgBillingRefetchQuery.graphql'
import {OrgBilling_organization$key} from '../../../../__generated__/OrgBilling_organization.graphql'
import {OrgBilling_query$key} from '../../../../__generated__/OrgBilling_query.graphql'
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
  const data = usePreloadedQuery<OrgBillingQuery>(
    graphql`
      query OrgBillingQuery($orgId: ID!, $first: Int!, $after: DateTime) {
        ...OrgBilling_query
      }
    `,
    queryRef,
    {
      UNSTABLE_renderPolicy: 'full'
    }
  )
  const [queryData, refetch] = useRefetchableFragment<OrgBillingRefetchQuery, OrgBilling_query$key>(
    graphql`
      fragment OrgBilling_query on Query @refetchable(queryName: "OrgBillingRefetchQuery") {
        ...OrgBillingInvoices_query
      }
    `,
    data
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
      <OrgBillingInvoices queryRef={queryData} />
      <OrgBillingDangerZone organization={organization} />
    </div>
  )
}

export default OrgBilling
