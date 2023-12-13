import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {PreloadedQuery, usePreloadedQuery} from 'react-relay'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router'
import {
  AUTHENTICATION_PAGE,
  BILLING_PAGE,
  MEMBERS_PAGE,
  ORG_SETTINGS_PAGE,
  TEAMS_PAGE
} from '../../../../utils/constants'
import {OrganizationQuery} from '../../../../__generated__/OrganizationQuery.graphql'
import OrgNav from '../Organization/OrgNav'
import OrgTeams from '../OrgTeams/OrgTeams'

const OrgPlansAndBillingRoot = lazy(
  () => import(/* webpackChunkName: 'OrgBillingRoot' */ './OrgPlansAndBillingRoot')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)

const OrgTeamMembers = lazy(
  () => import(/* webpackChunkName: 'OrgTeamMembers' */ '../OrgTeamMembers/OrgTeamMembersRoot')
)

const OrgDetails = lazy(() => import(/* webpackChunkName: 'OrgDetails' */ './OrgDetails'))
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
        isBillingLeader
      }
    }
  }
`

const Organization = (props: Props) => {
  const {queryRef} = props
  const {viewer} = usePreloadedQuery<OrganizationQuery>(query, queryRef)
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')!
  const {organization} = viewer
  if (!organization) return null
  const {id: orgId, isBillingLeader} = organization

  return (
    <section className={'px-4 md:px-8'}>
      <OrgNav organizationRef={organization} />
      <Switch>
        <Route
          exact
          path={`${match.url}`}
          render={() => <Redirect to={`${match.url}/${BILLING_PAGE}`} />}
        />
        <Route
          exact
          path={`${match.url}/${BILLING_PAGE}`}
          render={() => <OrgPlansAndBillingRoot organizationRef={organization} />}
        />

        <Route
          exact
          path={`${match.url}/${MEMBERS_PAGE}`}
          render={(p) => <OrgMembers {...p} orgId={orgId} />}
        />
        <Route
          exact
          path={`${match.url}/${ORG_SETTINGS_PAGE}`}
          render={(p) => <OrgDetails {...p} organizationRef={organization} />}
        />
        <Route
          exact
          path={`${match.url}/${AUTHENTICATION_PAGE}`}
          render={(p) => <Authentication {...p} orgId={orgId} />}
        />
        {isBillingLeader && (
          <>
            <Route
              exact
              path={`${match.url}/${TEAMS_PAGE}`}
              render={() => <OrgTeams organizationRef={organization} />}
            />
            <Route exact path={`${match.url}/${TEAMS_PAGE}/:teamId`} component={OrgTeamMembers} />
          </>
        )}
      </Switch>
    </section>
  )
}

export default Organization
