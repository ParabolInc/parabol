import {OrganizationPage_organization} from '__generated__/OrganizationPage_organization.graphql'
import React, {lazy, Suspense} from 'react'
import {createFragmentContainer, graphql} from 'react-relay'
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router'
import {BILLING_PAGE, MEMBERS_PAGE} from 'universal/utils/constants'
import LoadingComponent from '../../../../components/LoadingComponent/LoadingComponent'
import {LoaderSize} from '../../../../types/constEnums'
import {TierEnum} from '../../../../types/graphql'

interface Props extends RouteComponentProps<{orgId: string}> {
  organization: OrganizationPage_organization
}

const OrgPlanSqueeze = lazy(() =>
  import(/* webpackChunkName: 'OrgPlanSqueeze' */ 'universal/modules/userDashboard/components/OrgPlanSqueeze/OrgPlanSqueeze')
)
const OrgBilling = lazy(() =>
  import(/* webpackChunkName: 'OrgBillingRoot' */ 'universal/modules/userDashboard/containers/OrgBilling/OrgBillingRoot')
)
const OrgMembers = lazy(() =>
  import(/* webpackChunkName: 'OrgMembersRoot' */ 'universal/modules/userDashboard/containers/OrgMembers/OrgMembersRoot')
)

const OrganizationPage = (props: Props) => {
  const {match, organization} = props
  const {isBillingLeader, tier} = organization
  const onlyShowMembers = !isBillingLeader && tier !== TierEnum.personal
  const BillingComponent =
    isBillingLeader && tier !== TierEnum.personal ? OrgBilling : OrgPlanSqueeze
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
            render={(p) => <BillingComponent {...p} organization={organization} />}
          />
          <Route
            exact
            path={`${match.url}/${BILLING_PAGE}`}
            render={(p) => <BillingComponent {...p} organization={organization} />}
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
      ...OrgPlanSqueeze_organization
      ...OrgBillingRoot_organization
      id
      isBillingLeader
      tier
    }
  `
})
