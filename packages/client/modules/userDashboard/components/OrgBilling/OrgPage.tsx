import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {useFragment} from 'react-relay'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router'
import {BILLING_PAGE, MEMBERS_PAGE, ORG_SETTINGS_PAGE} from '../../../../utils/constants'
import {OrgPage_organization$key} from '../../../../__generated__/OrgPage_organization.graphql'
import OrgNav from '../Organization/OrgNav'

const OrgPlansAndBilling = lazy(
  () => import(/* webpackChunkName: 'OrgBillingRoot' */ './OrgPlansAndBilling')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)

const OrgDetails = lazy(() => import(/* webpackChunkName: 'OrgDetails' */ './OrgDetails'))

type Props = {
  organizationRef: OrgPage_organization$key
}

const OrgPage = (props: Props) => {
  const {organizationRef} = props
  const organization = useFragment(
    graphql`
      fragment OrgPage_organization on Organization {
        id
        ...OrgNav_organization
        ...OrgPlansAndBilling_organization
        ...OrgDetails_organization
      }
    `,
    organizationRef
  )
  const {id: orgId} = organization
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')!

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
          render={() => <OrgPlansAndBilling organizationRef={organization} />}
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
      </Switch>
    </section>
  )
}

export default OrgPage
