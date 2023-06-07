import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment, usePreloadedQuery, useRefetchableFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
import PaymentDetails from './PaymentDetails'
import BillingLeaders from './BillingLeaders'
import OrgPlans from './OrgPlans'
import OrgPlansAndBillingHeading from './OrgPlansAndBillingHeading'
import OrgPlanDrawer from './OrgPlanDrawer'
import OrgBillingInvoices from './OrgBillingInvoices'

type Props = {
  organizationRef: OrgPlansAndBilling_organization$key
  queryRef: any
}

const OrgPlansAndBilling = (props: Props) => {
  const {organizationRef, queryRef} = props
  // const data = usePreloadedQuery<OrgPlansAndBillingQuery>(
  const data = usePreloadedQuery<any>(
    graphql`
      query OrgPlansAndBillingQuery($orgId: ID!, $first: Int!, $after: DateTime) {
        ...OrgPlansAndBilling_query
      }
    `,
    queryRef
  )
  const [queryData, refetch] = useRefetchableFragment<
    any,
    // OrgPlansAndBillingRefetchQuery,
    any
    // OrgPlansAndBilling_query$key
  >(
    graphql`
      fragment OrgPlansAndBilling_query on Query
      @refetchable(queryName: "OrgPlansAndBillingRefetchQuery") {
        ...OrgBillingInvoices_query
      }
    `,
    data
  )
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

  if (tier === 'starter') {
    return (
      <Suspense fallback={''}>
        <OrgPlansAndBillingHeading organizationRef={organization} />
        <OrgPlans organizationRef={organization} />
        <PaymentDetails organizationRef={organization} />
        <BillingLeaders organizationRef={organization} />
        <OrgPlanDrawer organizationRef={organization} />
      </Suspense>
    )
  }

  return (
    <Suspense fallback={''}>
      <OrgPlansAndBillingHeading organizationRef={organization} />
      <OrgBillingInvoices queryRef={queryData} />
      <BillingLeaders organizationRef={organization} />
      <OrgPlans organizationRef={organization} />
      <OrgPlanDrawer organizationRef={organization} />
    </Suspense>
  )
}

export default OrgPlansAndBilling
