import graphql from 'babel-plugin-relay/macro'
import {lazy} from 'react'
import {type PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Navigate, Route, Routes} from 'react-router-dom'
import type {OrganizationQuery} from '../../../../__generated__/OrganizationQuery.graphql'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_INTEGRATIONS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../../../utils/constants'
import OrgNav from '../Organization/OrgNav'
import OrgTeams from '../OrgTeams/OrgTeams'

const OrgPlansAndBillingRoot = lazy(
  () => import(/* webpackChunkName: 'OrgPlansAndBillingRoot' */ './OrgPlansAndBillingRoot')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)

const OrgTeamMembers = lazy(
  () => import(/* webpackChunkName: 'OrgTeamMembers' */ '../OrgTeamMembers/OrgTeamMembersRoot')
)

const OrgDetails = lazy(() => import(/* webpackChunkName: 'OrgDetails' */ './OrgDetails'))

const OrgIntegrations = lazy(
  () => import(/* webpackChunkName: 'OrgIntegrations' */ '../OrgIntegrations/OrgIntegrations')
)

const Authentication = lazy(
  () =>
    import(
      /* webpackChunkName: 'Authentication' */ '../../containers/OrgAuthentication/OrgAuthenticationRoot'
    )
)

type Props = {
  queryRef: PreloadedQuery<OrganizationQuery>
}

const query = graphql`
  query OrganizationQuery($orgId: ID!) {
    viewer {
      organization(orgId: $orgId) {
        id
        ...OrgNav_organization
        ...OrgPlansAndBillingRoot_organization
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
  if (!organization) return null
  const {id: orgId} = organization

  return (
    <section className={'px-4 md:px-8'}>
      <OrgNav organizationRef={organization} />
      <Routes>
        <Route index element={<Navigate to={BILLING_PAGE} replace />} />
        <Route
          path={BILLING_PAGE}
          element={<OrgPlansAndBillingRoot organizationRef={organization} />}
        />
        <Route path={MEMBERS_PAGE} element={<OrgMembers orgId={orgId} />} />
        <Route path={ORG_SETTINGS_PAGE} element={<OrgDetails organizationRef={organization} />} />
        <Route
          path={ORG_INTEGRATIONS_PAGE}
          element={<OrgIntegrations organizationRef={organization} />}
        />
        <Route path={AUTHENTICATION_PAGE} element={<Authentication orgId={orgId} />} />
        <Route path={TEAMS_PAGE} element={<OrgTeams organizationRef={organization} />} />
        <Route path={`${TEAMS_PAGE}/:teamId`} element={<OrgTeamMembers />} />
      </Routes>
    </section>
  )
}

export default Organization
