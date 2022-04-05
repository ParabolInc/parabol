import React, {Suspense} from 'react'
import {PreloadedQuery, usePreloadedQuery, useFragment} from 'react-relay'
import graphql from 'babel-plugin-relay/macro'
import OrgBilling from '../../components/OrgBilling/OrgBilling'
import {
  OrgBillingRoot_organization,
  OrgBillingRoot_organization$key
} from '../../../../__generated__/OrgBillingRoot_organization.graphql'
import orgBillingRootQuery, {
  OrgBillingRootQuery
} from '../../../../__generated__/OrgBillingRootQuery.graphql'
import useQueryLoaderNow from '../../../../hooks/useQueryLoaderNow'

const query = graphql`
  query OrgBillingRootQuery($orgId: ID!, $first: Int!, $after: DateTime) {
    viewer {
      ...OrgBilling_viewer
    }
  }
`

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
  const queryRef = useQueryLoaderNow<OrgBillingRootQuery>(orgBillingRootQuery, {
    orgId: organization.id,
    first: 3
  })
  return (
    <Suspense fallback={''}>
      {queryRef && <OrgBillingContainer queryRef={queryRef} organization={organization} />}
    </Suspense>
  )
}

interface OrgBillingContainerProps {
  queryRef: PreloadedQuery<OrgBillingRootQuery>
  organization: OrgBillingRoot_organization
}

function OrgBillingContainer(props: OrgBillingContainerProps) {
  const {queryRef, organization} = props
  const data = usePreloadedQuery<OrgBillingRootQuery>(query, queryRef, {
    UNSTABLE_renderPolicy: 'full'
  })
  const {viewer} = data
  return <OrgBilling viewer={viewer} organization={organization} />
}

export default OrgBillingRoot
