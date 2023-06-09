import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {PreloadedQuery, useFragment, usePreloadedQuery, useRefetchableFragment} from 'react-relay'
import {OrgPlansAndBilling_organization$key} from '../../../../__generated__/OrgPlansAndBilling_organization.graphql'
import PaymentDetails from './PaymentDetails'
import BillingLeaders from './BillingLeaders'
import OrgPlans from './OrgPlans'
import OrgPlansAndBillingHeading from './OrgPlansAndBillingHeading'
import OrgPlanDrawer from './OrgPlanDrawer'
import OrgBillingInvoices from './OrgBillingInvoices'
import {OrgPlansAndBillingQuery} from '../../../../__generated__/OrgPlansAndBillingQuery.graphql'
import {OrgPlansAndBillingRefetchQuery} from '../../../../__generated__/OrgPlansAndBillingRefetchQuery.graphql'
import {OrgPlansAndBilling_query$key} from '../../../../__generated__/OrgPlansAndBilling_query.graphql'
import OrgBillingCreditCardInfo from './OrgBillingCreditCardInfo'

type Props = {
  organizationRef: OrgPlansAndBilling_organization$key
  queryRef: PreloadedQuery<OrgPlansAndBillingQuery>
}

const OrgPlansAndBilling = (props: Props) => {
  const {organizationRef, queryRef} = props
  const data = usePreloadedQuery<OrgPlansAndBillingQuery>(
    graphql`
      query OrgPlansAndBillingQuery($orgId: ID!, $first: Int!, $after: DateTime) {
        ...OrgPlansAndBilling_query
      }
    `,
    queryRef
  )
  const [queryData] = useRefetchableFragment<
    OrgPlansAndBillingRefetchQuery,
    OrgPlansAndBilling_query$key
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
        ...OrgBillingCreditCardInfo_organization
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
        <div className='pb-20'>
          <OrgPlansAndBillingHeading organizationRef={organization} />
          <OrgPlans organizationRef={organization} />
          <PaymentDetails organizationRef={organization} />
          <BillingLeaders organizationRef={organization} />
          <OrgPlanDrawer organizationRef={organization} />
        </div>
      </Suspense>
    )
  }

  return (
    <Suspense fallback={''}>
      <div className='pb-20'>
        <OrgPlansAndBillingHeading organizationRef={organization} />
        <OrgBillingInvoices queryRef={queryData} hasCheckoutFlowFlag />
        <OrgBillingCreditCardInfo organization={organization} hasCheckoutFlowFlag />
        <BillingLeaders organizationRef={organization} />
        <OrgPlans organizationRef={organization} />
        <OrgPlanDrawer organizationRef={organization} />
      </div>
    </Suspense>
  )
}

export default OrgPlansAndBilling
