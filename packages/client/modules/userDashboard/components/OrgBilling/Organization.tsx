import {Outlet} from '@tanstack/react-router'
import graphql from 'babel-plugin-relay/macro'
import {useMemo} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import type {OrganizationQuery} from '../../../../__generated__/OrganizationQuery.graphql'
import OrgNav from '../Organization/OrgNav'
import {OrganizationOutletContext} from './useOrganizationOutlet'

type Props = {
  queryRef: PreloadedQuery<OrganizationQuery>
}

const query = graphql`
  query OrganizationQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        id
        ...OrgNav_organization
        ...OrgPlansAndBilling_organization
        ...OrgDetails_organization
        ...OrgTeams_organization
        ...OrgIntegrations_organization
        isBillingLeader
      }
    }
  }
`

const Organization = (props: Props) => {
  const {queryRef} = props
  const {viewer} = usePreloadedQuery<OrganizationQuery>(query, queryRef)
  const {organization} = viewer
  const organizationOutlet = useMemo(
    () => (organization ? {organization, orgId: organization.id} : null),
    [organization]
  )
  if (!organizationOutlet) return null

  return (
    <section className={'px-4 md:px-8'}>
      <OrgNav organizationRef={organizationOutlet.organization} />
      <OrganizationOutletContext.Provider value={organizationOutlet}>
        <Outlet />
      </OrganizationOutletContext.Provider>
    </section>
  )
}

export default Organization
