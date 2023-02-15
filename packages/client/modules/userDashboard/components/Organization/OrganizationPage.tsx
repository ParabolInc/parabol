import graphql from 'babel-plugin-relay/macro'
import React, {lazy, Suspense} from 'react'
import {createFragmentContainer} from 'react-relay'
import {Redirect, Route, RouteComponentProps, Switch, withRouter} from 'react-router'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '../../../../types/constEnums'
import {BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'
import {OrganizationPage_organization} from '../../../../__generated__/OrganizationPage_organization.graphql'

interface Props extends RouteComponentProps<{orgId: string}> {
  organization: OrganizationPage_organization
}

const OrgBilling = lazy(
  () =>
    import(/* webpackChunkName: 'OrgBillingRoot' */ '../../containers/OrgBilling/OrgBillingRoot')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)

const OrganizationPage = (props: Props) => {
  const {match, organization} = props
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
        </Switch>
      )}
    </Suspense>
  )
}

export default createFragmentContainer(withRouter(OrganizationPage), {
  organization: graphql`
    fragment OrganizationPage_organization on Organization {
      ...OrgBillingRoot_organization
      id
      isBillingLeader
      tier
    }
  `
})
