import graphql from 'babel-plugin-relay/macro'
import React, {lazy, Suspense} from 'react'
import {useFragment} from 'react-relay'
import {Redirect, Route, Switch} from 'react-router'
import {OrganizationPage_organization$key} from '../../../../__generated__/OrganizationPage_organization.graphql'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import useRouter from '../../../../hooks/useRouter'
import {LoaderSize} from '../../../../types/constEnums'
import {AUTHENTICATION_PAGE, BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'

interface Props {
  organization: OrganizationPage_organization$key
}

const OrgBilling = lazy(
  () =>
    import(/* webpackChunkName: 'OrgBillingRoot' */ '../../containers/OrgBilling/OrgBillingRoot')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)
const OrgAuthentication = lazy(
  () =>
    import(
      /* webpackChunkName: 'OrgAuthenticationRoot' */ '../../containers/OrgAuthentication/OrgAuthenticationRoot'
    )
)

const OrganizationPage = (props: Props) => {
  const {organization: organizationRef} = props
  const {match} = useRouter<{orgId: string}>()
  const organization = useFragment(
    graphql`
      fragment OrganizationPage_organization on Organization {
        ...OrgBillingRoot_organization
        id
        isBillingLeader
        tier
      }
    `,
    organizationRef
  )
  const {isBillingLeader, tier} = organization
  const onlyShowMembers = !isBillingLeader && tier !== 'starter'
  const {
    params: {orgId}
  } = match
  return (
    <Suspense fallback={<LoadingComponent spinnerSize={LoaderSize.PANEL} />}>
      {onlyShowMembers ? (
        <OrgMembers orgId={orgId} />
      ) : (
        <Switch>
          <Route
            exact
            path={`${match.url}`}
            render={() => <Redirect to={`${match.url}/${BILLING_PAGE}`} />}
          />
          <Route
            exact
            path={`${match.url}/${BILLING_PAGE}`}
            render={(p) => <OrgBilling {...p} organization={organization} />}
          />
          <Route
            exact
            path={`${match.url}/${MEMBERS_PAGE}`}
            render={(p) => <OrgMembers {...p} orgId={orgId} />}
          />
          <Route
            exact
            path={`${match.url}/${AUTHENTICATION_PAGE}`}
            render={() => <OrgAuthentication orgId={orgId} />}
          />
        </Switch>
      )}
    </Suspense>
  )
}

export default OrganizationPage
