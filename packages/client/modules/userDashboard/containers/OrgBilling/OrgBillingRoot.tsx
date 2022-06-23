import graphql from 'babel-plugin-relay/macro'
import React, {Suspense} from 'react'
import {useFragment} from 'react-relay'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import orgBillingQuery, {OrgBillingQuery} from '../../../../__generated__/OrgBillingQuery.graphql'
import {OrgBillingRoot_organization$key} from '../../../../__generated__/OrgBillingRoot_organization.graphql'
import OrgBilling from '../../components/OrgBilling/OrgBilling'

interface Props {
  organization: OrgBillingRoot_organization$key
}

const OrgBillingRoot = ({organization: organizationRef}: Props) => {
  const organization = useFragment(
    graphql`
      fragment OrgBillingRoot_organization on Organization {
        ...OrgBilling_organization
        id
      }
    `,
    organizationRef
  )
  const queryRef = useQueryLoaderNow<OrgBillingQuery>(orgBillingQuery, {
    orgId: organization.id,
    first: 3
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <OrgBilling queryRef={queryRef} organizationRef={organization} />}
    </Suspense>
  )
}

export default OrgBillingRoot
