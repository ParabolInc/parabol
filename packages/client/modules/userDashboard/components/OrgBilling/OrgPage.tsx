import styled from '@emotion/styled'
import graphql from 'babel-plugin-relay/macro'
import React, {lazy} from 'react'
import {useFragment} from 'react-relay'
import {Redirect, Route, Switch, useRouteMatch} from 'react-router'
import {BILLING_PAGE, MEMBERS_PAGE} from '../../../../utils/constants'
import {OrgPage_organization$key} from '../../../../__generated__/OrgPage_organization.graphql'
import OrgNav from '../Organization/OrgNav'

const Container = styled('div')({
  padding: '0px 48px 24px 48px'
})

const OrgPlansAndBilling = lazy(
  () => import(/* webpackChunkName: 'OrgBillingRoot' */ './OrgPlansAndBilling')
)
const OrgMembers = lazy(
  () =>
    import(/* webpackChunkName: 'OrgMembersRoot' */ '../../containers/OrgMembers/OrgMembersRoot')
)

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
      }
    `,
    organizationRef
  )
  const {id: orgId} = organization
  const match = useRouteMatch<{orgId: string}>('/me/organizations/:orgId')!

  return (
    <Container>
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
      </Switch>
    </Container>
  )
}

export default OrgPage
