import graphql from 'babel-plugin-relay/macro'
import {Suspense} from 'react'
import {useFragment} from 'react-relay'
import orgPlansAndBillingQuery, {
  OrgPlansAndBillingQuery
} from '../../../../__generated__/OrgPlansAndBillingQuery.graphql'
import {OrgPlansAndBillingRoot_organization$key} from '../../../../__generated__/OrgPlansAndBillingRoot_organization.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'
import OrgPlansAndBilling from './OrgPlansAndBilling'

interface Props {
  organizationRef: OrgPlansAndBillingRoot_organization$key
}

const OrgPlansAndBillingRoot = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPlansAndBillingRoot_organization on Organization {
        ...OrgPlansAndBilling_organization
        id
      }
    `,
    organizationRef
  )

  const queryRef = useQueryLoaderNow<OrgPlansAndBillingQuery>(orgPlansAndBillingQuery, {
    orgId: organization.id,
    first: 3
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <OrgPlansAndBilling queryRef={queryRef} organizationRef={organization} />}
    </Suspense>
  )
}

export default OrgPlansAndBillingRoot
